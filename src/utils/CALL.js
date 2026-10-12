export const CALL = async ({ method, url, data = null, token = null, isFormData = false, contentType = null }) => {
    try {
      const headers = {};
  
      // Add Authorization header if token is provided
      if (token) headers["Authorization"] = `Bearer ${token}`;
  
      // Set Content-Type based on contentType, if provided, or default to JSON
      if (contentType && !isFormData) {
        headers["Content-Type"] = contentType;
      } else if (isFormData) {
        // Do not set Content-Type if FormData is being used (browser will handle it)
      } else {
        headers["Content-Type"] = "application/json"; // Default Content-Type for JSON data
      }
  
      const options = {
        method,
        headers,
        credentials: "include", // Ensures cookies are sent with the request
      };
  
      // If the request contains data (like FormData or JSON), append it to the request
      if (data) {
        if (isFormData) {
          // For FormData, the browser will handle the content type and boundary
          options.body = data;
        } else {
          // For regular JSON data, set the body and Content-Type
          options.body = JSON.stringify(data);
        }
      }
  
      // Perform the API request using fetch
      const response = await fetch(url, options);
  
      // If the response is not ok, throw an error
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong!");
      }
  
      // Parse and return the response data
      return await response.json();
    } catch (error) {
      const errorMsg = error.message || "Something went wrong!";
      throw { message: errorMsg };
    }
  };
  