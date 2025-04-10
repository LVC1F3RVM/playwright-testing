function createApiClient(request) {
  let token = null;
  let userId = null;
  const baseUrl = "https://demoqa.com";
  let storedCredentials = null;
  // Helper function to refresh token
  const refreshToken = async () => {
    if (!storedCredentials) {
      throw new Error("No credentials available for token refresh");
    }
    const response = await request.post(`${baseUrl}/Account/v1/GenerateToken`, {
      data: storedCredentials,
      headers: { "Content-Type": "application/json" },
    });
    token = (await response.json()).token;
    return token;
  };
  // User registration
  async function registerUser(user) {
    const response = await request.post("https://demoqa.com/Account/v1/User", {
      data: {
        userName: user.username,
        password: user.password,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (response.status() !== 201) {
      const error = await response.text();
      throw new Error(`Registration failed (${response.status()}): ${error}`);
    }

    const body = await response.json();
    userId = body.userID;
    return response;
  }
  // Log in into account
  async function login(user) {
    try {
      storedCredentials = {
        // Store credentials for future refreshes
        userName: user.username,
        password: user.password,
      };
      const response = await request.post(
        `https://demoqa.com/Account/v1/GenerateToken`,
        {
          data: storedCredentials,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Debugging: Log response details if needed
      if (response.status() !== 200) {
        const errorBody = await response.text();
        console.error("Login Error:", {
          status: response.status(),
          url: response.url(),
          body: errorBody,
        });
        throw new Error(`Login failed with status ${response.status()}`);
      }

      const responseBody = await response.json();
      if (!responseBody.token) {
        throw new Error("Token not found in response");
      }

      token = (await response.json()).token;
      return response;
    } catch (error) {
      console.error("Login Exception:", error.message);
      throw new Error(`Login request failed: ${error.message}`);
    }
  }
  // Adding a book to account
  async function addBookToUser(book) {
    try {
      if (!token || !userId) {
        throw new Error("Authentication required - missing token or userId");
      }

      const response = await request.post(`${baseUrl}/BookStore/v1/Books`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          userId: userId,
          collectionOfIsbns: [{ isbn: book.isbn }],
        },
      });

      if (response.status() !== 201) {
        const errorBody = await response.text();
        console.error("Add Book Error:", {
          status: response.status(),
          url: response.url(),
          body: errorBody,
        });
        throw new Error(`Failed to add book (status ${response.status()})`);
      }

      return response;
    } catch (error) {
      console.error("Add Book Exception:", error.message);
      throw new Error(`Book addition failed: ${error.message}`);
    }
  }
  // Removing a book from account
  async function removeBookFromUser(book) {
    try {
      if (!token || !userId) {
        throw new Error("Authentication required - missing token or userId");
      }

      const response = await request.delete(`${baseUrl}/BookStore/v1/Book`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          isbn: book.isbn,
          userId: userId,
        },
      });

      if (response.status() !== 204) {
        const errorBody = await response.text();
        console.error("Remove Book Error:", {
          status: response.status(),
          url: response.url(),
          body: errorBody,
        });
        throw new Error(`Failed to remove book (status ${response.status()})`);
      }

      return response;
    } catch (error) {
      console.error("Remove Book Exception:", error.message);
      throw new Error(`Book removal failed: ${error.message}`);
    }
  }
  // Deleting created user
  const deleteUser = async () => {
    try {
      // First attempt
      let response = await request.delete(
        `${baseUrl}/Account/v1/User/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Auto-refresh if token expired (401)
      if (response.status() === 401) {
        console.log("Token expired - automatically refreshing...");
        await refreshToken();
        response = await request.delete(
          `${baseUrl}/Account/v1/User/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Verify success
      if (response.status() !== 204) {
        throw new Error(`Deletion failed with status ${response.status()}`);
      }
      return response;
    } catch (error) {
      console.error("Delete User Failed:", {
        userId,
        tokenExists: !!token,
        error: error.message,
      });
      throw error;
    }
  };

  return {
    registerUser: registerUser,
    login: login,
    addBookToUser: addBookToUser,
    removeBookFromUser: removeBookFromUser,
    deleteUser: deleteUser,
  };
}

export default createApiClient;
