import React, { useState, useRef, useEffect } from "react";
import "./App.css";

// ----------------------
// AVATAR PRESET LISTS
// ----------------------

const teenPresets = [
  "/avatars/teen_black_boy.jpg",
  "/avatars/teen_black_girl.jpg",
  "/avatars/teen_white_brown_boy.jpg",
  "/avatars/teen_white_blonde_girl.jpg",
];

const youngAdultPresets = [
  "/avatars/adult_black_man.jpg",
  "/avatars/adult_black_woman.jpg",
  "/avatars/adult_white_man.jpg",
  "/avatars/adult_white_woman.jpg",
];

// Auto-center avatar in scrolling row (if needed later)
const centerAvatar = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }
};

function App() {
  // Screens 0–4 → onboarding, 5 → chat
  const [screen, setScreen] = useState(0);

  const [twinName, setTwinName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [gender, setGender] = useState("neutral");
  const [allowProfanity, setAllowProfanity] = useState(false);

  const [description, setDescription] = useState(""); // for generate screen
  const [avatarLoading, setAvatarLoading] = useState(false); // spinner state

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000";

  const nextScreen = () => setScreen((s) => s + 1);
  const prevScreen = () => setScreen((s) => s - 1);

  // ✅ Auto-scroll reference to bottom of chat
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // ----------------------------------------
  // GENERATE AVATAR WITH DESCRIPTION (Pollinations)
  // ----------------------------------------
  const generateAvatar = () => {
    if (!description.trim()) {
      alert("Describe what your twin should look like first!");
      return;
    }

    setAvatarLoading(true);

    const safePrompt = encodeURIComponent(
      description +
        ", realistic friendly portrait, soft background, centered"
    );

    const url = `https://image.pollinations.ai/prompt/${safePrompt}`;

    // Preload image so we know when it's done
    const img = new Image();
    img.onload = () => {
      setAvatarUrl(url);
      setAvatarLoading(false);
    };
    img.onerror = () => {
      alert("Failed to generate image. Try again!");
      setAvatarLoading(false);
    };
    img.src = url;
  };

  // ----------------------------------------
  // SEND MESSAGE TO BACKEND
  // ----------------------------------------
  const sendMessage = async () => {
    if (!message.trim()) return;

    setChat((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          user_id: "martin",
          gender,
          name: twinName,
          allow_profanity: allowProfanity,
        }),
      });

      const data = await res.json();

      // natural typing delay
      await new Promise((r) =>
        setTimeout(r, Math.random() * 900 + 400)
      );

      setChat((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (e) {
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // RENDER SCREENS
  // ----------------------------------------

  return (
    <div className="app-container">

      {/* SCREEN 0 — Name Your Twin */}
      {screen === 0 && (
        <div className="screen slide-in">
          <h1>Name Your Twin</h1>

          <input
            className="big-input"
            placeholder="Enter their name..."
            value={twinName}
            onChange={(e) => setTwinName(e.target.value)}
          />

          <button
            className="next-btn"
            disabled={!twinName.trim()}
            onClick={nextScreen}
          >
            Next ➜
          </button>
        </div>
      )}

      {/* SCREEN 1 — Choose preset or generate */}
      {screen === 1 && (
        <div className="screen slide-in">
          <h1>Create Your Twin</h1>

          <div className="choice-buttons">
            <button className="choice" onClick={() => nextScreen()}>
              Choose a Preset Twin
            </button>

            <button className="choice" onClick={() => setScreen(3)}>
              Generate Your Own Twin
            </button>
          </div>

          <button className="back-btn" onClick={prevScreen}>⬅ Back</button>
        </div>
      )}

      {/* SCREEN 2 — PRESET TWINS */}
      {screen === 2 && (
        <div className="screen slide-in">
          <h1>Select a Preset Twin</h1>

          {/* Teen Twins */}
          <div className="avatar-category">
            <h2 className="section-title">Teen Twins</h2>
            <div className="preset-grid">
              {teenPresets.map((url, index) => (
                <img
                  id={`teen-${index}`}
                  key={index}
                  src={url}
                  className={
                    "preset-image" + (avatarUrl === url ? " selected" : "")
                  }
                  onClick={() => {
                    setAvatarUrl(url);
                    centerAvatar(`teen-${index}`);
                  }}
                  alt="Teen preset"
                />
              ))}
            </div>
          </div>

          {/* Young Adult Twins */}
          <div className="avatar-category">
            <h2 className="section-title">Young Adult Twins</h2>
            <div className="preset-grid">
              {youngAdultPresets.map((url, index) => (
                <img
                  id={`adult-${index}`}
                  key={index}
                  src={url}
                  className={
                    "preset-image" + (avatarUrl === url ? " selected" : "")
                  }
                  onClick={() => {
                    setAvatarUrl(url);
                    centerAvatar(`adult-${index}`);
                  }}
                  alt="Adult preset"
                />
              ))}
            </div>
          </div>

          <button
            className="next-btn"
            disabled={!avatarUrl}
            onClick={nextScreen}
          >
            Next ➜
          </button>

          <button className="back-btn" onClick={prevScreen}>⬅ Back</button>
        </div>
      )}

      {/* SCREEN 3 — GENERATE YOUR OWN TWIN */}
      {screen === 3 && (
        <div className="screen slide-in">
          <h1>Generate Your Twin</h1>

          <div className="avatar-center">
            <div className="avatar-wrapper">
              <img
                src={avatarUrl || "/avatars/default.jpg"}
                className={
                  "avatar-preview-lg" + (avatarLoading ? " dim" : "")
                }
                alt="Generated twin"
              />
              {avatarLoading && <div className="spinner"></div>}
            </div>
          </div>

          <input
            className="big-input"
            placeholder="Describe how your twin should look..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {avatarLoading && (
            <p style={{ marginTop: "10px", opacity: 0.8 }}>
              Loading, please wait...
            </p>
          )}

          <button
            className="choice"
            onClick={generateAvatar}
            disabled={avatarLoading}
          >
            Generate From Description
          </button>

          {avatarUrl && !avatarLoading && (
            <button
              className="choice"
              onClick={generateAvatar}
            >
              Regenerate
            </button>
          )}

          <button
            className="next-btn"
            disabled={!avatarUrl || avatarLoading}
            onClick={nextScreen}
          >
            Next ➜
          </button>

          <button className="back-btn" onClick={() => setScreen(1)}>
            ⬅ Back
          </button>
        </div>
      )}

      {/* SCREEN 4 — SETTINGS */}
      {screen === 4 && (
        <div className="screen slide-in">
          <h1>Twin Settings</h1>

          <label>Gender:</label>
          <select
            className="big-input"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="neutral">Neutral</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={allowProfanity}
              onChange={(e) => setAllowProfanity(e.target.checked)}
            />
            Allow mild profanity
          </label>

          <button className="next-btn" onClick={() => setScreen(5)}>
            Start Chat 🚀
          </button>

          <button className="back-btn" onClick={prevScreen}>⬅ Back</button>
        </div>
      )}

      {/* SCREEN 5 — CHAT UI */}
      {screen === 5 && (
        <div className="chat-screen slide-in">

          <div className="header">
            <img src={avatarUrl} className="chat-avatar" alt="Twin" />
            <h2>{twinName}</h2>
          </div>

          <div className="chat-box">
            {chat.map((msg, i) => (
              <div key={i} className={`bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="bubble assistant typing">
                {twinName} is typing...
              </div>
            )}

            {/* ✅ Invisible auto-scroll anchor */}
            <div ref={bottomRef} />
          </div>

          <div className="input-area">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Say something..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>

        </div>
      )}

    </div>
  );
}

export default App;
