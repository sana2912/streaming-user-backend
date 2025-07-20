const track_model = require("../model_user/track_model");

module.exports.get_search_field = async (req, res) => {
    try {
        const { field } = req.query;
        const safeString = String(field).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const track_ = await track_model.find({ name: new RegExp(safeString, 'i'), }, 'name');
        res.status(200).json({
            message: 'connecting complete',
            datas: track_
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'we get some error from sever at : api/user/user/search/field',
            err_message: err
        })
    }
}
module.exports.display_search_data = async (req, res) => {
    try {
        const { key } = req.query;
        const safeString = String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const track_data = await track_model.find({ name: new RegExp(safeString, 'i'), });
        res.status(200).json({
            message: 'connecting complete',
            datas: track_data
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'we get some error from sever at : api/user/search/display',
            err_message: error
        })
    }
}