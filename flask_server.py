from flask import Flask, request, jsonify
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
import logging

app = Flask(__name__)

# 모델 및 토크나이저 로드
model = tf.keras.models.load_model('model.h5')
with open('tokenizer.pkl', 'rb') as f:
    tokenizer = pickle.load(f)

# API 엔드포인트 정의
@app.route('/analyze', methods=['POST'])
def analyze_code():
    try:
        # 클라이언트 요청에서 코드 받아오기
        data = request.json
        code = data.get('code', '')
        if not code:
            return jsonify({"error": "No code provided"}), 400
        
        # 코드 토큰화 및 패딩
        sequence = tokenizer.texts_to_sequences([code])
        padded_sequence = pad_sequences(sequence, maxlen=50)  # 패딩

        # 모델 예측
        prediction = model.predict(padded_sequence)
        print(f"Model Prediction: {prediction}")  # 예측 결과 출력

        is_vulnerable = prediction[0][0] > 0.5
        confidence = float(prediction[0][0])
        response = {
            "vulnerable": bool(is_vulnerable),
            "confidence": confidence,
            "vulnerability_type": "Potential vulnerability detected" if is_vulnerable else "No issues detected"
        }

        return jsonify(response)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
