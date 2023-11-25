const decodeToken = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const decodedPayload = JSON.parse(atob(parts[1]));
      return decodedPayload;
    }
  } catch (error) {
    console.error("Error decoding token:", error);
  }
  return null;
};

export default decodeToken;
