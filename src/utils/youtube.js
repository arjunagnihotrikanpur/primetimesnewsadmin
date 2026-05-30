export const getYoutubeVideoId = (url) => {
  if (!url) return null;

  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#&?]*).*/;

  const match = url.match(regExp);

  return match && match[7].length === 11 ? match[7] : null;
};

export const getYoutubeThumbnail = (url) => {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    return "https://via.placeholder.com/300x200?text=No+Thumbnail";
  }

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};
