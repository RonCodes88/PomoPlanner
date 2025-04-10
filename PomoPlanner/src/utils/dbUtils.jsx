export const getUserId = () => {
  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      const userData = JSON.parse(userString);
      return userData.userId;
    }
    return null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};
