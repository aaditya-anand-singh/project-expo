// src/App.jsx
import React, { useRef, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Webcam from "react-webcam";
import "@mediapipe/hands";
import "@mediapipe/camera_utils";
import "@mediapipe/drawing_utils";
import "./index.css";

/* ----------------------------------------------------------------
   Notes:
   - Place logo at: public/12.jpg
   - Backend endpoints expected:
     Auth:        POST /api/auth/register, POST /api/auth/login
     System:      POST /api/system/volume {type:'up'|'down'}
                  POST /api/system/brightness {type:'up'|'down'}
                  POST /api/system/screenshot
                  GET  /api/system/screenshots
                  GET  /api/system/youtube
                  GET  /api/system/mute
     Presentation:
                  POST /api/presentation/upload (multipart form-data "file")
                  (returns {success:true, slides:[{url|imageBase64}, ...]})
   - Camera auto-stop: We dispatch a global "stop-camera" on route changes,
     logout, and beforeunload. SystemControl/Presentation listen and stop
     MediaPipe camera + all video tracks.
------------------------------------------------------------------ */

// =============== RouteChangeHandler (fires stop-camera on navigation) ===============
const RouteChangeHandler = () => {
  const location = useLocation();
  useEffect(() => {
    // On every route change, ask camera pages to stop
    window.dispatchEvent(new Event("stop-camera"));
  }, [location.pathname]);

  useEffect(() => {
    const onUnload = () => window.dispatchEvent(new Event("stop-camera"));
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  return null;
};

// ================== MAIN APP ==================
const App = () => (
  <Router>
    <RouteChangeHandler />
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/elders" element={<Elders />} />
      <Route path="/hospital" element={<HospitalHotel />} />
      <Route path="/presentation" element={<PresentationMode />} />
      <Route path="/system" element={<SystemControl />} />
    </Routes>
  </Router>
);

// ================== REGISTER PAGE ==================
const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✅ Registered successfully! Please login now.");
        setTimeout(() => navigate("/"), 1200);
      } else setMsg("❌ " + (data.message || "Error"));
    } catch {
      setMsg("❌ Failed to register");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[url('/Interactive Hand with Holographic Icons Poster.png')] bg-cover bg-center">
      <div className="bg-black/70 p-8 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.5)] backdrop-blur-md text-center w-[340px] animate-fadeIn">
        <h1 className="text-cyan-400 text-2xl font-semibold mb-6">
          Register Account
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-cyan-400 text-black font-bold py-3 rounded-lg hover:bg-cyan-500 transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
          >
            Register
          </button>
        </form>
        {msg && <p className="text-gray-300 mt-4">{msg}</p>}
        <p className="text-gray-400 mt-3 text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-cyan-400 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

// ================== LOGIN PAGE (original look kept) ==================
const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        setMsg("✅ Login successful!");
        setTimeout(() => navigate("/dashboard"), 900);
      } else setMsg("❌ " + (data.message || "Invalid credentials"));
    } catch {
      setMsg("❌ Login failed. Try again later.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[url('/Interactive Hand with Holographic Icons Poster.png')] bg-cover bg-center">
      <div className="bg-black/70 p-8 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.5)] backdrop-blur-md text-center w-[340px] animate-fadeIn">
        <h1 className="text-cyan-400 text-2xl font-semibold mb-6">
          Hand Gesture Controller
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 mb-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-cyan-400 text-black font-bold py-3 rounded-lg hover:bg-cyan-500 transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
          >
            Login
          </button>
        </form>
        {msg && <p className="text-gray-300 mt-4">{msg}</p>}
        <p className="text-gray-400 mt-3 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-cyan-400 underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

// ================== NAVBAR ==================
const Navbar = () => {
  const navigate = useNavigate();
  const logout = () => {
    // stop camera before leaving
    window.dispatchEvent(new Event("stop-camera"));
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-black/80 flex flex-wrap justify-between items-center px-8 py-4 border-b border-cyan-500/30 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <img
          src="/12.jpg"
          alt="Logo"
          className="w-12 h-12 object-contain rounded-full border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]"
        />
        <h2 className="text-cyan-400 font-semibold">Hand Gesture Controller</h2>
      </div>
      <ul className="flex gap-6 flex-wrap justify-center items-center">
        <NavLink to="/dashboard" label="Home" />
        <NavLink to="/system" label="System" />
        <NavLink to="/presentation" label="Presentation" />
        <NavLink to="/elders" label="Elders" />
        <NavLink to="/hospital" label="Hospital/Hotel" />
        <li>
          <button
            onClick={logout}
            className="text-cyan-400 hover:text-white transition-all"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

const NavLink = ({ to, label }) => (
  <li>
    <Link
      to={to}
      onClick={() => window.dispatchEvent(new Event("stop-camera"))}
      className="text-white relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-cyan-400 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all hover:text-cyan-400"
    >
      {label}
    </Link>
  </li>
);

// ================== DASHBOARD ==================
const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  return (
    <div className="text-white min-h-screen bg-[#050c1a]">
      <Navbar />
      <section className="text-center mt-10">
        <div className="flex flex-col items-center justify-center mt-6">
          <img
            src="/12.jpg"
            alt="Logo"
            className="w-32 h-32 object-contain rounded-full border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,255,255,0.6)] animate-pulse"
          />
          <h1 className="text-3xl mt-4 text-cyan-400 font-semibold drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
            Hand Gesture Controller
          </h1>
          <p className="text-gray-400 mt-2">
            Control devices, presentations, and systems with your gestures!
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-11/12 mx-auto mt-12">
        <Card
          title="System Controller"
          text="Control volume, brightness, and media using hand gestures."
          link="/system"
        />
        <Card
          title="Hospital/Hotel"
          text="Use gestures to request services or control room features."
          link="/hospital"
        />
        <Card
          title="Elders"
          text="Assist elderly users with hands-free emergency or comfort controls."
          link="/elders"
        />
        <Card
          title="Presentation Mode"
          text="Upload PPT and control slides by hand."
          link="/presentation"
        />
      </section>
    </div>
  );
};

const Card = ({ title, text, link }) => (
  <div className="bg-black/60 border border-cyan-400/40 rounded-xl text-center p-6 hover:-translate-y-2 transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]">
    <h3 className="text-cyan-400 mb-2 text-lg">{title}</h3>
    <p className="text-gray-300 text-sm">{text}</p>
    <Link
      to={link}
      onClick={() => window.dispatchEvent(new Event("stop-camera"))}
      className="inline-block mt-4 bg-cyan-400 text-black font-bold px-4 py-2 rounded-md hover:bg-cyan-500"
    >
      Open
    </Link>
  </div>
);

// ================== SYSTEM CONTROL (B2 - Enhanced Neon) ==================
const SystemControl = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);

  const [gesture, setGesture] = useState("None");
  const [status, setStatus] = useState("Loading...");
  const [hud, setHud] = useState("");
  const [screenshots, setScreenshots] = useState([]);

  const lastActionTime = useRef(0);
  const gestureBuffer = useRef([]);
  const MAX_BUFFER = 8;

  // stop-camera listener
  useEffect(() => {
    const stopCam = () => {
      try {
        cameraRef.current?.stop();
      } catch {}
      try {
        const v = webcamRef.current?.video;
        v?.srcObject?.getTracks()?.forEach((t) => t.stop());
      } catch {}
    };
    window.addEventListener("stop-camera", stopCam);
    return () => window.removeEventListener("stop-camera", stopCam);
  }, []);

  const showHUD = (msg) => {
    setHud(msg);
    setTimeout(() => setHud(""), 1200);
  };

  const handleAction = async (endpoint, body = {}, msg = "") => {
    const now = Date.now();
    if (now - lastActionTime.current < 1800) return;
    lastActionTime.current = now;
    if (msg) showHUD(msg);
    try {
      const res = await fetch(`http://localhost:5000/api/system/${endpoint}`, {
        method: body.type ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: body.type ? JSON.stringify(body) : undefined,
      });
      if (endpoint === "screenshot") {
        const data = await res.json();
        if (data?.success) setScreenshots((prev) => [data, ...prev]);
      }
    } catch (err) {
      console.error("Backend Error:", err);
    }
  };

  // Load existing screenshots
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("http://localhost:5000/api/system/screenshots");
        if (r.ok) setScreenshots(await r.json());
      } catch {}
    })();
  }, []);

  // Init MediaPipe
  useEffect(() => {
    let camera;
    let mounted = true;

    const init = async () => {
      const hands = new window.Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      handsRef.current = hands;

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.75,
        minTrackingConfidence: 0.75,
      });

      hands.onResults((results) => {
        if (!mounted) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Match canvas to video size
        if (webcamRef.current?.video) {
          canvas.width = webcamRef.current.video.videoWidth || 640;
          canvas.height = webcamRef.current.video.videoHeight || 480;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (results.image)
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (!results.multiHandLandmarks?.length) {
          setGesture("None");
          return;
        }

        const lm = results.multiHandLandmarks[0];
        const handedness = results.multiHandedness?.[0]?.label || "Right";

        window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, {
          color: "#00FFFF",
          lineWidth: 2,
        });
        window.drawLandmarks(ctx, lm, { color: "#0ff", lineWidth: 1 });

        const tips = [4, 8, 12, 16, 20];
        const mids = [3, 6, 10, 14, 18];
        const raised = [];

        for (let i = 0; i < 5; i++) {
          if (i === 0) {
            if (handedness === "Right")
              raised[i] = lm[tips[i]].x < lm[mids[i]].x - 0.03;
            else raised[i] = lm[tips[i]].x > lm[mids[i]].x + 0.03;
          } else {
            raised[i] = lm[tips[i]].y < lm[mids[i]].y - 0.02;
          }
        }

        const count = raised.filter(Boolean).length;

        gestureBuffer.current.push(count);
        if (gestureBuffer.current.length > MAX_BUFFER)
          gestureBuffer.current.shift();

        const avgCount =
          gestureBuffer.current.reduce((a, b) => a + b, 0) /
          gestureBuffer.current.length;

        let detected = "None";

        if (avgCount > 0.5 && avgCount < 1.5 && raised[0]) {
          detected = "👍 Thumb Only → Volume Up";
          handleAction("volume", { type: "up" }, "🔊 Volume Up");
        } else if (avgCount >= 1.5 && avgCount < 2.5 && raised[0] && raised[1]) {
          detected = "👍👉 Thumb + Index → Volume Down";
          handleAction("volume", { type: "down" }, "🔉 Volume Down");
        } else if (
          avgCount >= 2.5 &&
          avgCount < 3.5 &&
          raised[0] &&
          raised[1] &&
          raised[2]
        ) {
          detected = "👍👉🖕 → Brightness Down";
          handleAction("brightness", { type: "down" }, "🌙 Brightness Down");
        } else if (
          avgCount >= 3.5 &&
          avgCount < 4.5 &&
          raised[0] &&
          raised[1] &&
          raised[2] &&
          raised[3]
        ) {
          detected = "👍👉🖕💍 → Brightness Up";
          handleAction("brightness", { type: "up" }, "🌞 Brightness Up");
        } else if (avgCount >= 4.5) {
          detected = "🖐️ → Screenshot";
          handleAction("screenshot", {}, "📸 Screenshot Taken");
        }

        setGesture(detected);
      });

      camera = new window.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (handsRef.current && webcamRef.current?.video)
            await handsRef.current.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });

      await camera.start();
      cameraRef.current = camera;
      setStatus("✅ Model Ready — Show your hand!");
    };

    init();

    return () => {
      mounted = false;
      try {
        cameraRef.current?.stop();
      } catch {}
      try {
        const v = webcamRef.current?.video;
        v?.srcObject?.getTracks()?.forEach((t) => t.stop());
      } catch {}
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050c1a] text-white relative">
      <Navbar />
      <div className="text-center mt-6">
        <h2 className="text-2xl text-cyan-400 mb-2">
          System Control — Neon Mode
        </h2>
        <p className="text-gray-400 mb-4">{status}</p>

        <div className="relative mx-auto w-[640px] h-[480px] rounded-2xl overflow-hidden border border-cyan-400 shadow-[0_0_40px_rgba(0,255,255,0.35)]">
          <Webcam
            ref={webcamRef}
            mirrored
            className="absolute w-full h-full object-cover"
            audio={false}
          />
          <canvas ref={canvasRef} className="absolute w-full h-full" />
          <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/60 text-cyan-300">
            {gesture}
          </div>
        </div>

        {hud && (
          <div className="mt-4 inline-block bg-green-600/80 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-lg">
            {hud}
          </div>
        )}

        <p className="text-gray-400 mt-4">
          👍 → Volume Up &nbsp;|&nbsp; 👍👉 → Volume Down &nbsp;|&nbsp; 👍👉🖕 →
          Brightness Down &nbsp;|&nbsp; 👍👉🖕💍 → Brightness Up &nbsp;|&nbsp; 🖐️
          → Screenshot
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-11/12 mx-auto mt-8">
          <button
            className="btn-neo"
            onClick={() =>
              handleAction("volume", { type: "up" }, "🔊 Volume Up")
            }
          >
            Volume +
          </button>
          <button
            className="btn-neo"
            onClick={() =>
              handleAction("volume", { type: "down" }, "🔉 Volume Down")
            }
          >
            Volume −
          </button>
          <button
            className="btn-neo"
            onClick={() =>
              handleAction("brightness", { type: "up" }, "🌞 Brightness Up")
            }
          >
            Brightness +
          </button>
          <button
            className="btn-neo"
            onClick={() =>
              handleAction("brightness", { type: "down" }, "🌙 Brightness Down")
            }
          >
            Brightness −
          </button>
          <button
            className="btn-neo"
            onClick={() => handleAction("screenshot", {}, "📸 Screenshot")}
          >
            Screenshot
          </button>
          <button
            className="btn-neo"
            onClick={() => handleAction("youtube", {}, "▶️ YouTube")}
          >
            YouTube
          </button>
          <button
            className="btn-neo col-span-2"
            onClick={() => handleAction("mute", {}, "🔇 Mute / Unmute")}
          >
            Mute / Unmute
          </button>
        </div>

        {/* Screenshot Gallery */}
        <div className="w-11/12 mx-auto mt-10">
          <h3 className="text-xl text-cyan-400 mb-4">📷 Recent Screenshots</h3>
          {screenshots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {screenshots.map((shot) => (
                <div
                  key={shot.id || shot._id}
                  className="bg-black/40 border border-cyan-400/40 rounded-lg overflow-hidden shadow-md"
                >
                  <img
                    src={shot.imageBase64 || shot.image}
                    alt="Screenshot"
                    className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <p className="text-gray-400 text-xs p-2">
                    {new Date(shot.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No screenshots captured yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ================== PRESENTATION MODE ==================
const PresentationMode = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);

  const [status, setStatus] = useState("Idle");
  const [slides, setSlides] = useState([]); // [{url|imageBase64}]
  const [current, setCurrent] = useState(0);
  const [hud, setHud] = useState("");
  const movementBuffer = useRef([]); // index finger x over time
  const MAX_MOV = 6;
  const lastAction = useRef(0);

  // stop-camera listener
  useEffect(() => {
    const stopCam = () => {
      try {
        cameraRef.current?.stop();
      } catch {}
      try {
        const v = webcamRef.current?.video;
        v?.srcObject?.getTracks()?.forEach((t) => t.stop());
      } catch {}
    };
    window.addEventListener("stop-camera", stopCam);
    return () => window.removeEventListener("stop-camera", stopCam);
  }, []);

  const showHUD = (t) => {
    setHud(t);
    setTimeout(() => setHud(""), 1000);
  };

  const uploadPpt = async (file) => {
    if (!file) return;
    setStatus("Uploading...");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("http://localhost:5000/api/presentation/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.slides?.length) {
        setSlides(data.slides);
        setCurrent(0);
        setStatus("Slides loaded");
      } else setStatus("Upload failed");
    } catch (e) {
      console.error(e);
      setStatus("Upload error");
    }
  };

  const nextSlide = () => {
    setCurrent((p) => Math.min(p + 1, (slides?.length || 1) - 1));
    showHUD("Next Slide");
  };
  const prevSlide = () => {
    setCurrent((p) => Math.max(p - 1, 0));
    showHUD("Previous Slide");
  };

  // Swipe detection with index finger
  useEffect(() => {
    let mounted = true;
    let camera;

    const init = async () => {
      const hands = new window.Hands({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });

      hands.onResults((results) => {
        if (!mounted) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (webcamRef.current?.video) {
          canvas.width = webcamRef.current.video.videoWidth || 640;
          canvas.height = webcamRef.current.video.videoHeight || 480;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (results.image)
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (!results.multiHandLandmarks?.length) {
          movementBuffer.current = [];
          return;
        }

        const lm = results.multiHandLandmarks[0];
        window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, {
          color: "#00FFFF",
          lineWidth: 2,
        });
        window.drawLandmarks(ctx, lm, { color: "#0ff", lineWidth: 1 });

        const idx = lm[8]; // index fingertip
        movementBuffer.current.push(idx.x);
        if (movementBuffer.current.length > MAX_MOV)
          movementBuffer.current.shift();

        if (movementBuffer.current.length >= MAX_MOV) {
          const first = movementBuffer.current[0];
          const last = movementBuffer.current[movementBuffer.current.length - 1];
          const delta = last - first; // +ve: right, -ve: left
          if (Math.abs(delta) > 0.22) {
            const now = Date.now();
            if (now - lastAction.current > 1000) {
              lastAction.current = now;
              if (delta < 0) nextSlide();
              else prevSlide();
              movementBuffer.current = [];
            }
          }
        }
      });

      camera = new window.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await hands.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });

      handsRef.current = hands;
      await camera.start();
      cameraRef.current = camera;
      setStatus("Camera ready — swipe index finger to control slides");
    };

    init();

    return () => {
      mounted = false;
      try {
        cameraRef.current?.stop();
      } catch {}
      try {
        const v = webcamRef.current?.video;
        v?.srcObject?.getTracks()?.forEach((t) => t.stop());
      } catch {}
    };
  }, []);

  // Keyboard fallback
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slides]);

  return (
    <div className="min-h-screen bg-[#050c1a] text-white">
      <Navbar />
      <main className="p-6">
        <h2 className="text-cyan-400 text-xl mb-1">Presentation Mode</h2>
        <p className="text-gray-400 mb-4">{status}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <div className="bg-black/60 p-4 rounded border border-cyan-400/20">
              <label className="block mb-2">Upload PPT / PPTX</label>
              <input
                type="file"
                accept=".ppt,.pptx"
                onChange={(e) => uploadPpt(e.target.files?.[0])}
              />
              <div className="mt-3 flex gap-2">
                <button onClick={prevSlide} className="btn-neo">
                  ◀ Prev
                </button>
                <button onClick={nextSlide} className="btn-neo">
                  Next ▶
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-300">
                Tip: Swipe your index finger left for next, right for previous.
              </p>
            </div>

            <div className="mt-4 relative w-full h-[480px] bg-black rounded overflow-hidden border border-cyan-400">
              <Webcam
                ref={webcamRef}
                mirrored
                className="absolute inset-0 w-full h-full object-cover"
                audio={false}
              />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            </div>
            {hud && (
              <div className="mt-2 inline-block px-3 py-1 bg-green-700/80 rounded">
                {hud}
              </div>
            )}
          </section>

          <section>
            <div className="bg-black/60 p-4 rounded border border-cyan-400/20">
              <h3 className="text-cyan-300 mb-2">Slides</h3>
              {slides.length === 0 ? (
                <p className="text-gray-400">No slides loaded. Upload a PPTX.</p>
              ) : (
                <div>
                  <div className="mb-3 text-sm text-gray-300">
                    Slide {current + 1} / {slides.length}
                  </div>
                  <div className="w-full h-[360px] bg-black rounded overflow-hidden flex items-center justify-center border border-cyan-400/20">
                    <img
                      src={
                        slides[current].url ||
                        slides[current].imageBase64 ||
                        slides[current]
                      }
                      alt="slide"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-6 gap-2 overflow-x-auto">
                    {slides.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`p-1 border rounded ${
                          i === current ? "border-cyan-300" : "border-cyan-600"
                        }`}
                      >
                        <img
                          src={s.url || s.imageBase64 || s}
                          alt={`thumb-${i}`}
                          className="w-20 h-12 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// ================== PLACEHOLDER MODE PAGES ==================
const ModePage = ({ title, buttons }) => (
  <div className="min-h-screen bg-[#050c1a] text-white">
    <Navbar />
    <div className="text-center mt-8">
      <h2 className="text-2xl text-cyan-400 mb-8">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-11/12 mx-auto">
        {buttons.map((btn, i) => (
          <div
            key={i}
            className="bg-black/60 border border-cyan-400/40 rounded-lg p-4 text-sm"
          >
            {btn}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Elders = () => (
  <ModePage
    title="Elder Assistance Mode"
    buttons={["🏠 Home", "⚙️ Settings", "💡 Light Control", "📞 Emergency Call"]}
  />
);
const HospitalHotel = () => (
  <ModePage
    title="Hospital / Hotel Mode"
    buttons={["🚨 Emergency", "💡 Bed Light", "🍲 Food Request", "📞 Call Nurse"]}
  />
);

export default App;
