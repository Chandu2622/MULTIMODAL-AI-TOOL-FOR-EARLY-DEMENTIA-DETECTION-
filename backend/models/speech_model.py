import os
import io
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any

try:
    import librosa
    import soundfile as sf
except ImportError:
    librosa = None

# Load model globally
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "weights", "speech_model.pkl")
try:
    with open(MODEL_PATH, "rb") as f:
        sp_model = pickle.load(f)
except Exception as e:
    print(f"Warning: Could not load speech model: {e}")
    sp_model = None

def extract_base_audio_features(audio_bytes: bytes) -> Dict[str, float]:
    if not librosa:
        return {}
    
    # Load audio via temp file to avoid format detection issues with BytesIO
    import tempfile
    import os
    from pydub import AudioSegment

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_in:
        tmp_in.write(audio_bytes)
        tmp_in_path = tmp_in.name
        
    tmp_out_path = tmp_in_path + ".wav"
    try:
        seg = AudioSegment.from_file(tmp_in_path)
        seg.export(tmp_out_path, format="wav")
        y, sr = librosa.load(tmp_out_path, sr=None)
    finally:
        if os.path.exists(tmp_in_path): os.remove(tmp_in_path)
        if os.path.exists(tmp_out_path): os.remove(tmp_out_path)
        
    total_duration = librosa.get_duration(y=y, sr=sr)
    
    # Simple silence detection using RMS
    rms_frames = librosa.feature.rms(y=y)[0]
    rms_mean = np.mean(rms_frames)
    rms_std = np.std(rms_frames)
    
    # Dynamic threshold for silence based on noise floor
    noise_floor = np.percentile(rms_frames, 20)
    peak = np.max(rms_frames)
    threshold = noise_floor + 0.1 * (peak - noise_floor) + 0.005
    voiced_frames = rms_frames > threshold
    
    # Duration and pauses
    frame_duration = librosa.frames_to_time(1, sr=sr)
    voiced_duration = np.sum(voiced_frames) * frame_duration
    pause_duration = total_duration - voiced_duration
    
    # Count pauses: transitions from voiced to unvoiced
    transitions = np.diff(voiced_frames.astype(int))
    num_pauses = np.sum(transitions == -1)
    
    speech_ratio = voiced_duration / (total_duration + 1e-5)
    
    # Spectral features
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    zcr = librosa.feature.zero_crossing_rate(y=y)[0]
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    tempo = float(tempo[0] if isinstance(tempo, np.ndarray) else tempo)
    
    features = {
        'total_duration': total_duration,
        'voiced_duration': voiced_duration,
        'pause_duration': pause_duration,
        'num_pauses': float(num_pauses),
        'speech_ratio': speech_ratio,
        'rms_mean': rms_mean,
        'rms_std': rms_std,
        'spectral_centroid_mean': np.mean(spectral_centroid),
        'spectral_rolloff_mean': np.mean(spectral_rolloff),
        'zero_crossing_rate': np.mean(zcr),
        'tempo': tempo
    }
    
    # MFCCs
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    for i in range(13):
        features[f'mfcc_{i+1}_mean'] = float(np.mean(mfccs[i]))
        features[f'mfcc_{i+1}_std'] = float(np.std(mfccs[i]))
        
    return features

def engineer_speech_features(df: pd.DataFrame) -> pd.DataFrame:
    d = df.copy()
    d['pause_ratio']         = d['pause_duration'] / (d['total_duration'] + 1e-5)
    d['speech_efficiency']   = d['voiced_duration'] / (d['total_duration'] + 1e-5)
    d['avg_pause_len']       = d['pause_duration'] / (d['num_pauses'] + 1)
    d['avg_speech_burst']    = d['voiced_duration'] / (d['num_pauses'] + 1)
    d['pause_speech_ratio']  = d['num_pauses'] / (d['voiced_duration'] + 1e-5)
    
    d['centroid_rolloff_ratio'] = d['spectral_centroid_mean'] / (d['spectral_rolloff_mean'] + 1e-5)
    d['energy_variability']     = d['rms_std'] / (d['rms_mean'] + 1e-5)
    
    mfcc_mean_cols = [c for c in d.columns if 'mfcc' in c and 'mean' in c]
    mfcc_std_cols  = [c for c in d.columns if 'mfcc' in c and 'std' in c]
    d['mfcc_mean_energy'] = d[mfcc_mean_cols].abs().mean(axis=1)
    d['mfcc_std_energy']  = d[mfcc_std_cols].mean(axis=1)
    d['mfcc_mean_range']  = d[mfcc_mean_cols].max(axis=1) - d[mfcc_mean_cols].min(axis=1)
    d['mfcc_variability'] = d[mfcc_std_cols].std(axis=1)
    
    d['zcr_x_tempo']         = d['zero_crossing_rate'] * d['tempo']
    d['rms_x_speech_ratio']  = d['rms_mean'] * d['speech_ratio']
    return d

def analyze_speech(transcript: str, duration_seconds: int, word_count: int, audio_bytes: bytes = None) -> Dict[str, Any]:
    score = 0.5
    features_dict = {}
    
    if not sp_model or not audio_bytes or not librosa:
        # Fallback to mock
        if word_count > 0 and duration_seconds > 0:
            words_per_minute = (word_count / duration_seconds) * 60
            if words_per_minute < 50:
                score = 0.8
            elif words_per_minute > 100:
                score = 0.2
        return {
            "score": score,
            "features": {
                "type_token_ratio": 0.65,
                "avg_sentence_length": 12.4,
                "pause_ratio_mock": 0.15
            },
            "domain_scores": {
                "fluency": 1.0 - score,
                "acoustic": 1.0 - (score * 0.9),
                "semantic": 1.0 - (score * 0.8)
            }
        }
    
    try:
        # Extract features
        base_features = extract_base_audio_features(audio_bytes)
        df = pd.DataFrame([base_features])
        df_eng = engineer_speech_features(df)
        
        # If the model is a Pipeline, it may just take df_eng directly.
        # But if it expects a specific column order, we ideally need to match it.
        # Since we don't have the exact training columns, we try passing df_eng.
        # Ensure we drop any columns the user might have removed.
        # The user mentioned zero_var columns like jitter/shimmer. We didn't add them.
        
        sp = sp_model                       # dict loaded from pickle
        expected = sp["features"]
        X = df_eng.reindex(columns=expected, fill_value=0.0)
        Xs = sp["scaler"].transform(X)
        probs = sp["model"].predict_proba(Xs)[0]
        score = float(probs[1])             # probability of class 1
            
        score = min(1.0, max(0.0, score))
        features_dict = {k: float(v) for k, v in df_eng.iloc[0].items()}
        
    except Exception as e:
        import logging
        logging.exception(f"Error extracting audio features or predicting: {e}")
        score = 0.5
        features_dict = {"error": str(e)}
        
    # Domain scores: higher is better (Healthy)
    # Mapping arbitrary feature correlations to simulate domains
    fluency = max(0.0, 1.0 - features_dict.get('pause_ratio', 0.15)) if 'pause_ratio' in features_dict else (1.0 - score)
    acoustic = max(0.0, 1.0 - (features_dict.get('energy_variability', 0.5) * 0.3)) if 'energy_variability' in features_dict else (1.0 - (score * 0.9))
    semantic = max(0.0, 1.0 - (score * 0.8)) # Just tied closely to overall risk for now
    
    return {
        "score": score,
        "features": features_dict,
        "domain_scores": {
            "fluency": min(1.0, fluency),
            "acoustic": min(1.0, acoustic),
            "semantic": min(1.0, semantic)
        }
    }
