const { uploadImagesViaImageKit, deleteImagesViaImageKit } = require('../utils/imageKit');
const { FOLDERS, MAX_IMAGE_SIZE } = require('../config/constants');
const ErrorHandler = require('../utils/errorHandler');

/**
 * Service to handle image operations
 */
const imageService = {
    /**
     * Validates and uploads multiple images
     */
    uploadImages: async (files, folder = FOLDERS.ARTICLES) => {
        if (!files || files.length === 0) return [];

        for (const file of files) {
            if (file.size > MAX_IMAGE_SIZE) {
                throw new ErrorHandler(413, `Image ${file.originalname} is greater than 5 MB.`);
            }
        }

        const uploadPromises = files.map(file => 
            uploadImagesViaImageKit(file.buffer, file.originalname, folder)
        );

        return await Promise.all(uploadPromises);
    },

    /**
     * Uploads a single avatar image
     */
    uploadAvatar: async (file, email) => {
        if (!file) return null;
        
        const subFolderPath = email.split('@')[0];
        const destination = `${FOLDERS.AVATARS}${subFolderPath}`;
        
        return await uploadImagesViaImageKit(file.buffer, file.originalname, destination);
    },

    /**
     * Deletes images
     */
    deleteImages: async (fileIds) => {
        if (!fileIds || fileIds.length === 0) return;
        return await deleteImagesViaImageKit(fileIds);
    }
};

module.exports = imageService;
