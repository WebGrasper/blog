const imagekit = require("imagekit");

const ImageKit = new imagekit({
    publicKey: "public_v0j9tK3PYBZ+w4xIE1L83wyw1f0=",
    privateKey: "private_SETXKsfjPM6s1VGhHIGm78GtXc4=",
    urlEndpoint: "https://ik.imagekit.io/94nzrpaat",
})

module.exports.uploadImagesViaImageKit = async(imageBuffer, imageName) =>{
    imageBuffer = imageBuffer.toString('base64');
    let data = undefined;
    await ImageKit.upload({
        file: imageBuffer,
        fileName: imageName,
        extensions: [
            {
                name: "google-auto-tagging",
                maxTags: 10,
                minConfidence: 95,
            }
        ]
    }).then((res) => {
        data = res;
    }).catch((err) => {
        return next(new ErrorHandler(302, `Image cannot upload, ${err}`));
    })
    return data.url;
};