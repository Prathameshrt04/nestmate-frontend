const handleApiError = (error) => {
    const message = error.message || 'An unexpected error occurred';
    return {
      success: false,
      message,
      details: error.response?.data || null,
    };
  };
  
  const handleApiSuccess = (data) => {
    return {
      success: true,
      data,
    };
  };
  
  const apiUtils = {
    handleApiError,
    handleApiSuccess,
  };
  
  export default apiUtils;