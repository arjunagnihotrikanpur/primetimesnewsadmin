import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";

import { getYoutubeThumbnail, getYoutubeVideoId } from "../utils/youtube";

export default function Channels() {
  const [channels, setChannels] = useState([]);

  const [search, setSearch] = useState("");

  const [showAddChannelModal, setShowAddChannelModal] = useState(false);

  const [showVideoModal, setShowVideoModal] = useState(false);

  const [selectedChannel, setSelectedChannel] = useState(null);

  const [editingVideo, setEditingVideo] = useState(null);

  const [channelForm, setChannelForm] = useState({
    name: "",
    thumbnail: "",
  });

  const [videoForm, setVideoForm] = useState({
    title: "",
    youtubeUrl: "",
    views: "",
  });

  // LOAD CHANNELS

  useEffect(() => {
    const q = query(collection(db, "channels"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChannels(data);
    });

    return () => unsubscribe();
  }, []);

  // FILTER CHANNELS

  const filteredChannels = useMemo(() => {
    if (!search.trim()) return channels;

    return channels.filter((channel) =>
      channel.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [channels, search]);

  // ADD CHANNEL

  const addChannel = async () => {
    if (!channelForm.name.trim() || !channelForm.thumbnail.trim()) {
      alert("Fill all fields");

      return;
    }

    await addDoc(collection(db, "channels"), {
      name: channelForm.name,
      thumbnail: channelForm.thumbnail,
      videos: [],
      createdAt: serverTimestamp(),
    });

    setChannelForm({
      name: "",
      thumbnail: "",
    });

    setShowAddChannelModal(false);
  };

  // DELETE CHANNEL

  const deleteChannel = async (channelId) => {
    const confirmed = window.confirm("Delete this channel?");

    if (!confirmed) return;

    await deleteDoc(doc(db, "channels", channelId));
  };

  // OPEN ADD VIDEO

  const openAddVideo = (channel) => {
    setSelectedChannel(channel);

    setEditingVideo(null);

    setVideoForm({
      title: "",
      youtubeUrl: "",
      views: "",
    });

    setShowVideoModal(true);
  };

  // OPEN EDIT VIDEO

  const openEditVideo = (channel, video) => {
    setSelectedChannel(channel);

    setEditingVideo(video);

    setVideoForm({
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      views: video.views,
    });

    setShowVideoModal(true);
  };

  // SAVE VIDEO

  const saveVideo = async () => {
    if (!videoForm.title.trim() || !videoForm.youtubeUrl.trim()) {
      alert("Fill all fields");

      return;
    }

    if (!getYoutubeVideoId(videoForm.youtubeUrl)) {
      alert("Invalid YouTube URL");

      return;
    }

    const updatedVideos = [...(selectedChannel.videos || [])];

    // EDIT VIDEO

    if (editingVideo) {
      const edited = updatedVideos.map((video) => {
        if (video.id === editingVideo.id) {
          return {
            ...video,
            title: videoForm.title,
            youtubeUrl: videoForm.youtubeUrl,
            views: Number(videoForm.views) || 0,
          };
        }

        return video;
      });

      await updateDoc(doc(db, "channels", selectedChannel.id), {
        videos: edited,
      });
    }

    // ADD VIDEO
    else {
      updatedVideos.push({
        id: crypto.randomUUID(),
        title: videoForm.title,
        youtubeUrl: videoForm.youtubeUrl,
        views: Number(videoForm.views) || 0,
        createdAt: Date.now(),
      });

      await updateDoc(doc(db, "channels", selectedChannel.id), {
        videos: updatedVideos,
      });
    }

    setShowVideoModal(false);
  };

  // DELETE VIDEO

  const deleteVideo = async (channelId, videoId) => {
    const confirmed = window.confirm("Delete this video?");

    if (!confirmed) return;

    const channel = channels.find((item) => item.id === channelId);

    if (!channel) return;

    const updatedVideos = channel.videos.filter(
      (video) => video.id !== videoId,
    );

    await updateDoc(doc(db, "channels", channelId), {
      videos: updatedVideos,
    });
  };

  return (
    <div
      className="layout"
      style={{
        background: "#020617",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <Sidebar />

      <div
        className="content"
        style={{
          padding: "26px",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                fontWeight: "800",
                letterSpacing: "-2px",
              }}
            >
              Channels
            </h1>

            <p
              style={{
                color: "#94a3b8",
                marginTop: "8px",
                fontSize: "16px",
              }}
            >
              Manage all channels and videos.
            </p>
          </div>

          <button
            onClick={() => setShowAddChannelModal(true)}
            style={primaryButton}
          >
            + Add Channel
          </button>
        </div>

        {/* SEARCH */}

        <input
          placeholder="Search channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInput}
        />

        {/* HORIZONTAL CHANNEL SCROLLER */}

        <div
          style={{
            display: "flex",
            gap: "24px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginTop: "26px",
            scrollBehavior: "smooth",
          }}
        >
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              style={{
                minWidth: "620px",
                maxWidth: "620px",
                background: "linear-gradient(180deg,#081028 0%, #0b1730 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "30px",
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              }}
            >
              {/* THUMBNAIL */}

              <div
                style={{
                  position: "relative",
                }}
              >
                <img
                  src={channel.thumbnail}
                  alt={channel.name}
                  style={{
                    width: "100%",
                    height: "280px",
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(2,6,23,1), rgba(2,6,23,0.1))",
                  }}
                />
              </div>

              {/* CONTENT */}

              <div
                style={{
                  padding: "24px",
                }}
              >
                {/* TOP */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "32px",
                        fontWeight: "800",
                        letterSpacing: "-1px",
                      }}
                    >
                      {channel.name}
                    </h2>

                    <p
                      style={{
                        marginTop: "8px",
                        color: "#94a3b8",
                        fontSize: "15px",
                        marginBottom: 0,
                      }}
                    >
                      {channel.videos?.length || 0} Videos
                    </p>
                  </div>

                  <button
                    onClick={() => deleteChannel(channel.id)}
                    style={dangerButton}
                  >
                    Delete
                  </button>
                </div>

                {/* ADD VIDEO */}

                <button
                  onClick={() => openAddVideo(channel)}
                  style={{
                    ...primaryButton,
                    width: "100%",
                    marginBottom: "20px",
                  }}
                >
                  + Add Video
                </button>

                {/* VIDEOS */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    maxHeight: "460px",
                    overflowY: "auto",
                    paddingRight: "4px",
                  }}
                >
                  {(channel.videos || [])
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((video) => (
                      <div
                        key={video.id}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          borderRadius: "22px",
                          padding: "14px",
                          display: "flex",
                          gap: "14px",
                          alignItems: "center",
                        }}
                      >
                        {/* VIDEO THUMB */}

                        <img
                          src={getYoutubeThumbnail(video.youtubeUrl)}
                          alt={video.title}
                          style={{
                            width: "180px",
                            height: "102px",
                            objectFit: "cover",
                            borderRadius: "16px",
                            flexShrink: 0,
                          }}
                        />

                        {/* VIDEO INFO */}

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <h3
                            style={{
                              marginTop: 0,
                              marginBottom: "10px",
                              fontSize: "17px",
                              lineHeight: 1.4,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {video.title}
                          </h3>

                          <p
                            style={{
                              color: "#94a3b8",
                              marginBottom: "14px",
                              fontSize: "14px",
                            }}
                          >
                            {video.views || 0} views
                          </p>

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                            }}
                          >
                            <button
                              onClick={() => openEditVideo(channel, video)}
                              style={secondaryButton}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteVideo(channel.id, video.id)}
                              style={dangerButton}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {channel.videos?.length === 0 && (
                    <div
                      style={{
                        border: "1px dashed rgba(255,255,255,0.1)",
                        borderRadius: "22px",
                        padding: "30px",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      No videos yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ADD CHANNEL MODAL */}

        {showAddChannelModal && (
          <div style={modalWrapper}>
            <div style={modalCard}>
              <div style={modalHeader}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "30px",
                  }}
                >
                  Add Channel
                </h2>

                <button
                  style={closeButton}
                  onClick={() => setShowAddChannelModal(false)}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <input
                  placeholder="Channel Name"
                  value={channelForm.name}
                  onChange={(e) =>
                    setChannelForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  style={darkInput}
                />

                <input
                  placeholder="Thumbnail URL"
                  value={channelForm.thumbnail}
                  onChange={(e) =>
                    setChannelForm((prev) => ({
                      ...prev,
                      thumbnail: e.target.value,
                    }))
                  }
                  style={darkInput}
                />

                {channelForm.thumbnail && (
                  <img
                    src={channelForm.thumbnail}
                    alt="Preview"
                    style={{
                      width: "100%",
                      borderRadius: "22px",
                    }}
                  />
                )}

                <button onClick={addChannel} style={primaryButton}>
                  Add Channel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIDEO MODAL */}

        {showVideoModal && (
          <div style={modalWrapper}>
            <div style={modalCard}>
              <div style={modalHeader}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "30px",
                  }}
                >
                  {editingVideo ? "Edit Video" : "Add Video"}
                </h2>

                <button
                  style={closeButton}
                  onClick={() => setShowVideoModal(false)}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <input
                  placeholder="Video Title"
                  value={videoForm.title}
                  onChange={(e) =>
                    setVideoForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  style={darkInput}
                />

                <input
                  placeholder="YouTube URL"
                  value={videoForm.youtubeUrl}
                  onChange={(e) =>
                    setVideoForm((prev) => ({
                      ...prev,
                      youtubeUrl: e.target.value,
                    }))
                  }
                  style={darkInput}
                />

                <input
                  type="number"
                  placeholder="Views"
                  value={videoForm.views}
                  onChange={(e) =>
                    setVideoForm((prev) => ({
                      ...prev,
                      views: e.target.value,
                    }))
                  }
                  style={darkInput}
                />

                {videoForm.youtubeUrl &&
                  getYoutubeVideoId(videoForm.youtubeUrl) && (
                    <img
                      src={getYoutubeThumbnail(videoForm.youtubeUrl)}
                      alt="Preview"
                      style={{
                        width: "100%",
                        borderRadius: "22px",
                      }}
                    />
                  )}

                <button onClick={saveVideo} style={primaryButton}>
                  {editingVideo ? "Save Changes" : "Add Video"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* STYLES */

const searchInput = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#fff",
  padding: "18px 22px",
  borderRadius: "22px",
  outline: "none",
  fontSize: "16px",
};

const darkInput = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  padding: "15px 18px",
  borderRadius: "18px",
  outline: "none",
  fontSize: "15px",
};

const primaryButton = {
  background: "linear-gradient(135deg,#2563eb,#3b82f6)",
  color: "#fff",
  border: "none",
  padding: "15px 20px",
  borderRadius: "18px",
  cursor: "pointer",
  fontWeight: "800",
  fontSize: "14px",
};

const secondaryButton = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "13px",
};

const dangerButton = {
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.2)",
  color: "#ef4444",
  padding: "10px 16px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "13px",
};

const modalWrapper = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(10px)",
  padding: "20px",
};

const modalCard = {
  width: "100%",
  maxWidth: "560px",
  background: "linear-gradient(180deg,#081028 0%, #0b1730 100%)",
  borderRadius: "32px",
  padding: "30px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
};

const closeButton = {
  width: "46px",
  height: "46px",
  borderRadius: "16px",
  border: "none",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "15px",
};
