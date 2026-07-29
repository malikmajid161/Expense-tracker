"""
Streamlit Dashboard — DrowsyGuard
CoderAxo Internship CAX-OL-2026-290
Author: Majid Malik
Institution: COMSATS University Islamabad, Wah Campus
Run: streamlit run app.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import streamlit as st
import cv2, time

st.set_page_config(page_title="DrowsyGuard", page_icon="🚗", layout="wide")

st.markdown("""
<style>
body,.main{background:#0d0d1a;}
[data-testid="metric-container"]{background:#151528;border-radius:12px;
  padding:14px;border:1px solid #2a2a4a;}
.alert-ok{background:#0a2e18;border-left:5px solid #00cc44;border-radius:10px;
  padding:14px 18px;font-size:16px;font-weight:bold;color:#80ffb0;margin:6px 0;}
.alert-warn{background:#2e1a00;border-left:5px solid #ffaa00;border-radius:10px;
  padding:14px 18px;font-size:16px;font-weight:bold;color:#ffd580;margin:6px 0;}
.alert-danger{background:#2e0000;border-left:5px solid #ff2222;border-radius:10px;
  padding:14px 18px;font-size:18px;font-weight:bold;color:#ff8080;margin:6px 0;}
.alert-calib{background:#001830;border-left:5px solid #00ccff;border-radius:10px;
  padding:14px 18px;font-size:15px;color:#80ddff;margin:6px 0;}
.header-card{background:#151528;border-radius:14px;padding:14px 20px;
  margin-bottom:12px;border:1px solid #2a2a4a;}
.yawn-badge{background:#2e1a00;border:1px solid #ffaa00;border-radius:8px;
  padding:8px 14px;font-size:14px;color:#ffd580;text-align:center;margin:4px 0;}
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="header-card">
  <h2 style="margin:0;color:#00ccff;">🚗 DrowsyGuard — Real-Time Drowsiness Monitor</h2>
  <p style="margin:4px 0 0;color:#aaa;font-size:12px;">
    CoderAxo AI/ML Internship &nbsp;|&nbsp; CAX-OL-2026-290 &nbsp;|&nbsp;
    <b style="color:#ddd;">Majid Malik</b> &nbsp;|&nbsp;
    COMSATS University Islamabad, Wah Campus &nbsp;|&nbsp;
    <span style="color:#888;">Detection: YawDD Dataset Method</span>
  </p>
</div>
""", unsafe_allow_html=True)

col1, col2 = st.columns([2, 1])
with col1:
    frame_ph = st.empty()

with col2:
    state_ph = st.empty()
    st.write("")

    # Row 1: EAR + MAR
    rc1, rc2 = st.columns(2)
    ear_ph   = rc1.empty()
    mar_ph   = rc2.empty()
    st.write("")

    # Row 2: PERCLOS + Yawn count
    rc3, rc4 = st.columns(2)
    perclos_ph = rc3.empty()
    yawn_ph    = rc4.empty()
    st.write("")

    # Alert message box
    alert_ph = st.empty()
    st.write("")

    # Session
    dur_ph = st.empty()

bc1, bc2 = st.columns(2)
run  = bc1.button("▶ Start Monitoring", type="primary", use_container_width=True)
stop = bc2.button("⏹ Stop",                             use_container_width=True)

if run:
    from detector import DrowsinessDetector
    cap = cv2.VideoCapture(0)
    det = DrowsinessDetector()

    if not cap.isOpened():
        st.error("❌ Webcam not found!")
    else:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret or stop: break

            frame, data = det.process_frame(frame)
            frame_ph.image(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB),
                           channels="RGB", use_container_width=True)

            state     = data['state']
            alert_msg = data.get('alert_msg','')
            yawn_c    = data.get('yawn_count',0)
            perclos   = data.get('perclos',0.0)

            icons = {"ALERT":"🟢","DROWSY":"🟡","VERY_DROWSY":"🔴",
                     "NO_FACE":"⚫","CALIBRATING":"🔵"}
            icon = icons.get(state,"⚪")
            state_ph.markdown(
                f"<h2 style='margin:0;color:#ddd;'>{icon} {state.replace('_',' ')}</h2>",
                unsafe_allow_html=True)

            ear_ph.metric("👁 EAR",       f"{data['ear']:.3f}")
            mar_ph.metric("👄 MAR",       f"{data['mar']:.3f}")
            perclos_ph.metric("📊 PERCLOS", f"{perclos:.0%}")
            yawn_ph.metric("😮 Yawns/min", yawn_c)
            dur_ph.metric("⏱ Session",    f"{data['session_duration']}s")

            # Alert box
            if state == "CALIBRATING":
                alert_ph.markdown(
                    '<div class="alert-calib">🔵 Calibrating — eyes open, face camera</div>',
                    unsafe_allow_html=True)
            elif state == "VERY_DROWSY":
                alert_ph.markdown(
                    f'<div class="alert-danger">🚨 {alert_msg}</div>',
                    unsafe_allow_html=True)
            elif state in ("DROWSY","NO_FACE") and alert_msg:
                alert_ph.markdown(
                    f'<div class="alert-warn">⚠️ {alert_msg}</div>',
                    unsafe_allow_html=True)
            else:
                alert_ph.markdown(
                    '<div class="alert-ok">✅ Driver Alert — All Good</div>',
                    unsafe_allow_html=True)

            time.sleep(0.03)

        cap.release()
        st.info("✅ Session ended.")
