import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";

import {
  getCategories,
  addCategory,
  deleteCategory,
  deleteMultipleCategories,
  exportCategoriesToCSV,
} from "../services/categories";

import { updateDoc, doc } from "firebase/firestore";

import { db } from "../services/firebase";

const ICON_OPTIONS = [
  "business",
  "globe",
  "newspaper",
  "tv",
  "megaphone",
  "radio",
  "mic",
  "film",
];

export default function Categories() {
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");

  const [icon, setIcon] = useState("business");

  const [editingId, setEditingId] = useState(null);

  const [editingTitle, setEditingTitle] = useState("");

  const [editingIcon, setEditingIcon] = useState("business");

  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState([]);

  const [search, setSearch] = useState("");

  const loadCategories = async () => {
    setLoading(true);

    const data = await getCategories();

    setCategories(data);

    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async () => {
    if (!title.trim()) return;

    await addCategory({
      title,
      icon,
      videos: [],
      order: categories.length,
    });

    setTitle("");

    setIcon("business");

    loadCategories();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) return;

    await deleteCategory(id);

    setSelected((prev) => prev.filter((item) => item !== id));

    loadCategories();
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selected.length} selected categories?`,
    );

    if (!confirmed) return;

    await deleteMultipleCategories(selected);

    setSelected([]);

    loadCategories();
  };

  const startEditing = (category) => {
    setEditingId(category.id);

    setEditingTitle(category.title);

    setEditingIcon(category.icon);
  };

  const saveEdit = async (category) => {
    if (!editingTitle.trim()) return;

    await updateDoc(doc(db, "categories", category.id), {
      title: editingTitle,
      icon: editingIcon,
      videos: category.videos || [],
      order: category.order || 0,
    });

    setEditingId(null);

    loadCategories();
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredCategories = useMemo(() => {
    return [...categories]
      .filter((category) =>
        category.title?.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories, search]);

  const selectAll = () => {
    if (selected.length === filteredCategories.length) {
      setSelected([]);
    } else {
      setSelected(filteredCategories.map((item) => item.id));
    }
  };

  return (
    <div
      className="layout"
      style={{
        background: "#050816",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <Sidebar />

      <div
        className="content"
        style={{
          padding: "28px",
        }}
      >
        <div
          className="topbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "34px",
                fontWeight: "800",
                color: "#fff",
              }}
            >
              Categories
            </h1>

            <p
              style={{
                color: "#94a3b8",
                marginTop: "8px",
              }}
            >
              Manage your content categories with a modern admin panel.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button onClick={selectAll} style={secondaryButton}>
              {selected.length === filteredCategories.length &&
              filteredCategories.length > 0
                ? "Unselect All"
                : "Select All"}
            </button>

            <button
              onClick={() => exportCategoriesToCSV(filteredCategories)}
              style={primaryButton}
            >
              Export CSV
            </button>

            <button
              disabled={selected.length === 0}
              onClick={handleBulkDelete}
              style={{
                ...dangerButton,
                opacity: selected.length === 0 ? 0.5 : 1,
                cursor: selected.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Delete Selected
            </button>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #111827 0%, #0f172a 100%)",
            border: "1px solid #1e293b",
            padding: "22px",
            borderRadius: "24px",
            marginBottom: "28px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            <input
              placeholder="Category title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />

            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              style={inputStyle}
            >
              {ICON_OPTIONS.map((item) => (
                <option
                  key={item}
                  value={item}
                  style={{
                    background: "#0f172a",
                    color: "#fff",
                  }}
                >
                  {item}
                </option>
              ))}
            </select>

            <button onClick={handleAdd} style={primaryButton}>
              Add Category
            </button>
          </div>

          <input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              marginTop: "18px",
              width: "100%",
            }}
          />
        </div>

        {loading ? (
          <div style={emptyState}>
            <h3>Loading categories...</h3>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={emptyState}>
            <h3>No categories found</h3>
          </div>
        ) : (
          <div
            className="card-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "22px",
            }}
          >
            {filteredCategories.map((category) => {
              const isSelected = selected.includes(category.id);

              return (
                <div
                  key={category.id}
                  style={{
                    background:
                      "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
                    borderRadius: "24px",
                    padding: "22px",
                    border: isSelected
                      ? "2px solid #3b82f6"
                      : "1px solid #1e293b",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    transition: "0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "14px",
                      marginBottom: "18px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(category.id)}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />

                      <div
                        style={{
                          width: "54px",
                          height: "54px",
                          borderRadius: "16px",
                          background:
                            "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {category.icon}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(category.id)}
                      style={dangerButton}
                    >
                      Delete
                    </button>
                  </div>

                  {editingId === category.id ? (
                    <>
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        style={{
                          ...inputStyle,
                          marginBottom: "14px",
                        }}
                      />

                      <select
                        value={editingIcon}
                        onChange={(e) => setEditingIcon(e.target.value)}
                        style={{
                          ...inputStyle,
                          marginBottom: "16px",
                        }}
                      >
                        {ICON_OPTIONS.map((item) => (
                          <option
                            key={item}
                            value={item}
                            style={{
                              background: "#0f172a",
                              color: "#fff",
                            }}
                          >
                            {item}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "24px",
                          color: "#fff",
                        }}
                      >
                        {category.title}
                      </h3>

                      <p
                        style={{
                          marginTop: "10px",
                          color: "#94a3b8",
                        }}
                      >
                        Icon:{" "}
                        <span
                          style={{
                            color: "#fff",
                            fontWeight: "600",
                          }}
                        >
                          {category.icon}
                        </span>
                      </p>

                      <div
                        style={{
                          marginTop: "18px",
                          display: "inline-flex",
                          padding: "8px 14px",
                          borderRadius: "999px",
                          background: "rgba(59,130,246,0.12)",
                          color: "#60a5fa",
                          fontWeight: "700",
                          fontSize: "14px",
                          border: "1px solid rgba(59,130,246,0.2)",
                        }}
                      >
                        {category.videos?.length || 0} Videos
                      </div>
                    </>
                  )}

                  <div
                    className="actions"
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "24px",
                    }}
                  >
                    {editingId === category.id ? (
                      <button
                        onClick={() => saveEdit(category)}
                        style={primaryButton}
                      >
                        Save Changes
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditing(category)}
                        style={secondaryButton}
                      >
                        Edit
                      </button>
                    )}

                    {editingId === category.id && (
                      <button
                        onClick={() => setEditingId(null)}
                        style={dangerButton}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  color: "#fff",
  padding: "14px 16px",
  borderRadius: "14px",
  outline: "none",
  fontSize: "15px",
  width: "100%",
  boxSizing: "border-box",
};

const primaryButton = {
  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
  border: "none",
  color: "#fff",
  padding: "14px 18px",
  borderRadius: "14px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(59,130,246,0.25)",
};

const secondaryButton = {
  background: "#111827",
  border: "1px solid #1e293b",
  color: "#fff",
  padding: "14px 18px",
  borderRadius: "14px",
  fontWeight: "700",
  cursor: "pointer",
};

const dangerButton = {
  background: "#dc2626",
  border: "none",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: "14px",
  fontWeight: "700",
  cursor: "pointer",
};

const emptyState = {
  background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
  border: "1px solid #1e293b",
  borderRadius: "24px",
  padding: "60px 24px",
  textAlign: "center",
  color: "#94a3b8",
};
