import wave
import math
import struct
import os

def generate_tick_wav(filename, frequency=1200, duration=0.08, sample_rate=44100):
    num_samples = int(sample_rate * duration)
    wav_file = wave.open(filename, 'w')
    wav_file.setnchannels(1) # mono
    wav_file.setsampwidth(2) # 16-bit
    wav_file.setframerate(sample_rate)

    for i in range(num_samples):
        t = i / sample_rate
        # Sharp transient woodblock attack envelope
        envelope = math.exp(-i / (sample_rate * 0.012))
        # Dual frequency click sound for mechanical clock feel
        val = (math.sin(2 * math.pi * frequency * t) * 0.7 + math.sin(2 * math.pi * (frequency * 1.5) * t) * 0.3) * envelope
        # Convert to 16-bit PCM integer (-32768 to 32767)
        packed_val = struct.pack('<h', int(val * 30000))
        wav_file.writeframes(packed_val)

    wav_file.close()
    print(f"Generated clean tick sound at {filename}")

os.makedirs('public/sons', exist_ok=True)
generate_tick_wav('public/sons/tictac.wav', frequency=1400, duration=0.08)
generate_tick_wav('public/sons/tictac_panic.wav', frequency=2200, duration=0.06)
