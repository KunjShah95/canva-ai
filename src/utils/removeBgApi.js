/**
 * Remove.bg API Wrapper
 * 
 * @param {string} base64Image - The base64 string of the image (without data:image/... prefix calls usually needed, or just standard base64)
 * @param {string} apiKey - The Remove.bg API Key
 * @returns {Promise<Blob>} - The processed image as a Blob
 */
export const removeBackground = async (imageFile, apiKey) => {
    if (!apiKey) {
        throw new Error("API Key is required");
    }

    const formData = new FormData();
    formData.append("image_file", imageFile);
    formData.append("size", "auto");

    try {
        const response = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: {
                "X-Api-Key": apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.title || "Failed to remove background");
        }

        return await response.blob();
    } catch (error) {
        console.error("Remove.bg Error:", error);
        throw error;
    }
};
