import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";

import { getCategories } from "../services/categories";

import { updateDoc, doc } from "firebase/firestore";

import { db } from "../services/firebase";

import { getYoutubeThumbnail, getYoutubeVideoId } from "../utils/youtube";

export default function Videos() {
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [title, setTitle] = useState("");

  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [search, setSearch] = useState("");

  const [selectedVideos, setSelectedVideos] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);

  const [editingViews, setEditingViews] = useState({});

  const loadCategories = async () => {
    const data = await getCategories();

    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const allVideos = categories.flatMap((category) =>
    (category.videos || []).map((video, index) => ({
      ...video,
      index,
      categoryId: category.id,
      categoryTitle: category.title,
    })),
  );

  const filteredVideos = useMemo(() => {
    let videos =
      selectedCategory === "all"
        ? allVideos
        : allVideos.filter((video) => video.categoryId === selectedCategory);

    if (!search.trim()) return videos;

    return videos.filter((video) =>
      video.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [allVideos, selectedCategory, search]);

  const isDuplicateUrl = allVideos.some(
    (video) =>
      getYoutubeVideoId(video.youtubeUrl) === getYoutubeVideoId(youtubeUrl),
  );

  const addVideo = async () => {
    if (selectedCategory === "all") {
      alert("Select a category");

      return;
    }

    if (!title.trim() || !youtubeUrl.trim()) {
      alert("Fill all fields");

      return;
    }

    if (isDuplicateUrl) {
      alert("Video already exists");

      return;
    }

    const category = categories.find((item) => item.id === selectedCategory);

    if (!category) return;

    const updatedVideos = [
      ...(category.videos || []),

      {
        id: crypto.randomUUID(),
        title,
        youtubeUrl,
        views: 0,
        featured: false,
        hidden: false,
        createdAt: Date.now(),
      },
    ];

    await updateDoc(doc(db, "categories", selectedCategory), {
      videos: updatedVideos,
    });

    setTitle("");
    setYoutubeUrl("");

    setShowAddModal(false);

    loadCategories();
  };

  const deleteVideo = async (categoryId, videoId) => {
    const confirmed = window.confirm("Delete this video?");

    if (!confirmed) return;

    const category = categories.find((item) => item.id === categoryId);

    if (!category) return;

    const updatedVideos = category.videos.filter(
      (video) => video.id !== videoId,
    );

    await updateDoc(doc(db, "categories", categoryId), {
      videos: updatedVideos,
    });

    loadCategories();
  };

  const toggleHidden = async (categoryId, videoId) => {
    const category = categories.find((item) => item.id === categoryId);

    if (!category) return;

    const updatedVideos = category.videos.map((video) => {
      if (video.id === videoId) {
        return {
          ...video,
          hidden: !video.hidden,
        };
      }

      return video;
    });

    await updateDoc(doc(db, "categories", categoryId), {
      videos: updatedVideos,
    });

    loadCategories();
  };

  const toggleFeatured = async (categoryId, videoId) => {
    for (const category of categories) {
      const updatedVideos = category.videos.map((video) => {
        if (category.id === categoryId && video.id === videoId) {
          return {
            ...video,
            featured: !video.featured,
          };
        }

        return {
          ...video,
          featured: false,
        };
      });

      await updateDoc(doc(db, "categories", category.id), {
        videos: updatedVideos,
      });
    }

    loadCategories();
  };

  const updateViews = async (categoryId, videoId, newViews) => {
    const parsedViews = Number(newViews);

    if (isNaN(parsedViews) || parsedViews < 0) {
      alert("Enter valid views");

      return;
    }

    const category = categories.find((item) => item.id === categoryId);

    if (!category) return;

    const updatedVideos = category.videos.map((video) => {
      if (video.id === videoId) {
        return {
          ...video,
          views: parsedViews,
        };
      }

      return video;
    });

    await updateDoc(doc(db, "categories", categoryId), {
      videos: updatedVideos,
    });

    loadCategories();
  };

  const bulkDelete = async () => {
    const confirmed = window.confirm("Delete selected videos?");

    if (!confirmed) return;

    for (const category of categories) {
      const updatedVideos = category.videos.filter(
        (video) => !selectedVideos.includes(video.id),
      );

      await updateDoc(doc(db, "categories", category.id), {
        videos: updatedVideos,
      });
    }

    setSelectedVideos([]);

    loadCategories();
  };

  const bulkHide = async () => {
    for (const category of categories) {
      const updatedVideos = category.videos.map((video) => {
        if (selectedVideos.includes(video.id)) {
          return {
            ...video,
            hidden: true,
          };
        }

        return video;
      });

      await updateDoc(doc(db, "categories", category.id), {
        videos: updatedVideos,
      });
    }

    setSelectedVideos([]);

    loadCategories();
  };

  const toggleSelected = (id) => {
    setSelectedVideos((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  const selectAllVideos = () => {
    setSelectedVideos(filteredVideos.map((video) => video.id));
  };

  const unselectAllVideos = () => {
    setSelectedVideos([]);
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
          padding: "30px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            marginBottom: "28px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: "800",
              letterSpacing: "-1px",
            }}
          >
            Videos Dashboard
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "8px",
            }}
          >
            Manage all uploaded videos easily.
          </p>
        </div>

        {/* ADD MODAL */}
        {showAddModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              backdropFilter: "blur(8px)",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "540px",
                background: "#0f172a",
                borderRadius: "26px",
                padding: "28px",
                border: "1px solid #1e293b",
                boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "28px",
                  }}
                >
                  Add Video
                </h2>

                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#1e293b",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={darkInput}
                >
                  <option value="all">Select Category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={darkInput}
                />

                <input
                  placeholder="YouTube URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  style={darkInput}
                />

                {youtubeUrl && getYoutubeVideoId(youtubeUrl) && (
                  <img
                    src={getYoutubeThumbnail(youtubeUrl)}
                    alt="Preview"
                    style={{
                      width: "100%",
                      borderRadius: "18px",
                      border: "1px solid #1e293b",
                    }}
                  />
                )}

                {isDuplicateUrl && (
                  <div
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      color: "#ef4444",
                      padding: "12px",
                      borderRadius: "14px",
                      fontWeight: "700",
                    }}
                  >
                    Duplicate video URL
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    marginTop: "10px",
                  }}
                >
                  <button
                    style={secondaryButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>

                  <button style={primaryButton} onClick={addVideo}>
                    Add Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FILTER BAR */}
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            padding: "18px",
            borderRadius: "22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={darkInput}
            >
              <option value="all">All Categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>

            <input
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                ...darkInput,
                flex: 1,
                minWidth: "240px",
              }}
            />
          </div>

          <button style={primaryButton} onClick={() => setShowAddModal(true)}>
            + Add Video
          </button>
        </div>

        {/* BULK ACTIONS */}
        {filteredVideos.length > 0 && (
          <div
            style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              padding: "16px",
              borderRadius: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button style={secondaryButton} onClick={selectAllVideos}>
                Select All
              </button>

              <button style={secondaryButton} onClick={unselectAllVideos}>
                Unselect All
              </button>
            </div>

            {selectedVideos.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button style={secondaryButton} onClick={bulkHide}>
                  Hide Selected
                </button>

                <button style={dangerButton} onClick={bulkDelete}>
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIDEO GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedVideos.includes(video.id)}
                    onChange={() => toggleSelected(video.id)}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {video.featured && (
                      <div
                        style={{
                          background: "rgba(245,158,11,0.15)",
                          color: "#f59e0b",
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        FEATURED
                      </div>
                    )}

                    {video.hidden && (
                      <div
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          color: "#ef4444",
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        HIDDEN
                      </div>
                    )}
                  </div>
                </div>

                <img
                  src={getYoutubeThumbnail(video.youtubeUrl)}
                  alt={video.title}
                  style={{
                    width: "100%",
                    borderRadius: "18px",
                    marginBottom: "16px",
                    border: "1px solid #1e293b",
                    filter: video.hidden ? "grayscale(100%)" : "none",
                  }}
                />

                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "10px",
                    fontSize: "20px",
                    lineHeight: 1.4,
                  }}
                >
                  {video.title}
                </h3>

                <p
                  style={{
                    color: "#94a3b8",
                    marginBottom: "8px",
                  }}
                >
                  {video.categoryTitle}
                </p>

                {/* VIEWS EDIT */}
                <div
                  style={{
                    marginTop: "16px",
                    marginBottom: "18px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#94a3b8",
                      fontSize: "14px",
                    }}
                  >
                    Views
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="number"
                      value={editingViews[video.id] ?? video.views ?? 0}
                      onChange={(e) =>
                        setEditingViews((prev) => ({
                          ...prev,
                          [video.id]: e.target.value,
                        }))
                      }
                      style={{
                        ...darkInput,
                        flex: 1,
                      }}
                    />

                    <button
                      style={primaryButton}
                      onClick={() =>
                        updateViews(
                          video.categoryId,
                          video.id,
                          editingViews[video.id] ?? video.views ?? 0,
                        )
                      }
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    style={secondaryButton}
                    onClick={() => toggleFeatured(video.categoryId, video.id)}
                  >
                    {video.featured ? "Unfeature" : "Feature"}
                  </button>

                  <button
                    style={secondaryButton}
                    onClick={() => toggleHidden(video.categoryId, video.id)}
                  >
                    {video.hidden ? "Unhide" : "Hide"}
                  </button>

                  <button
                    style={dangerButton}
                    onClick={() => deleteVideo(video.categoryId, video.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// STYLES

const darkInput = {
  background: "#020617",
  border: "1px solid #334155",
  color: "#fff",
  padding: "13px 15px",
  borderRadius: "14px",
  outline: "none",
  fontSize: "14px",
};

const primaryButton = {
  background: "linear-gradient(135deg,#2563eb,#3b82f6)",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "14px",
};

const secondaryButton = {
  background: "#1e293b",
  color: "#fff",
  border: "1px solid #334155",
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "14px",
};

const dangerButton = {
  background: "linear-gradient(135deg,#dc2626,#ef4444)",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "14px",
};
