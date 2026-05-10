module.exports = {
    FOLDERS: {
        ARTICLES: '/WG-ARTICLES-IMAGES/',
        AVATARS: '/WG-USERS-PROFILE-IMAGES/',
    },
    PAGINATION: {
        DEFAULT_LIMIT: 10,
        DEFAULT_PAGE: 1,
    },
    CORS_WHITELIST: [
        'https://webgrasper.vercel.app',
        'http://65.21.198.80:3000',
        'https://stashify-app.vercel.app',
        'http://localhost:3000'
    ],
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
};
