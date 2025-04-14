const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(url);
      img.onerror = () => reject(url); // Reject invalid URLs
      // Set a timeout to avoid hanging on slow loads
      setTimeout(() => reject(url), 5000);
    });
  };
  
  const getValidImageUrl = async (url) => {
    try {
      const validUrl = await preloadImage(url);
      return validUrl;
    } catch (error) {
      return null; // Return null for invalid URLs
    }
  };
  
  export { getValidImageUrl };