const album_model = require("../model_user/album_model");

module.exports.list_album = async (req, res) => {
    try {
        const album_datas = await album_model.find();
        res.status(200).json({ success: true, album_datas: album_datas });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'we get error from sever at list album data' });
    }
}