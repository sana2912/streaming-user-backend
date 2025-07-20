const track_model = require("../model_user/track_model");

module.exports.list_track = async (req, res) => {
    try {
        const track_data = await track_model.find();
        res.status(200).json({ sucess: true, track_data: track_data });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "we get some err from sever" });
    }
};
