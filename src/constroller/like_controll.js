const track_model = require("../model_user/track_model");
const user_model = require("../model_user/user_model");
module.exports.display_like = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        let arr = [];
        const user_ = await user_model.findById(user_id, 'likes');
        if (user_) {
            for (let item of user_.likes) {
                const like = await track_model.findById(item);
                arr.push(like);
            }
            res.status(200).json({
                message: 'success',
                likes: arr
            })
        }
        else {
            res.status(202).json({
                message: 'ไม่พบข้อมูลของคุณ',
            })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
module.exports.like_state = async (req, res) => {
    try {
        const track_id = req.query.track_id;
        const user_id = req.user.user_id;
        const user_ = await user_model.findById(user_id);
        let state = false;
        if (user_.likes.length > 0) {
            state = user_.likes.includes(track_id);
        }
        res.status(200).json({
            message: 'complete',
            state: state
        })
    } catch (error) {
        console.error(error);
        res.status(200).json({
            message: 'error',
            err_message: error.message
        });
    }
}
module.exports.push_like = async (req, res) => {
    try {
        const track_id = req.body.track_id;
        const user_id = req.user.user_id;
        const user_ = await user_model.findById(user_id);
        user_.likes.push(track_id);
        await user_.save();
        res.status(200).json({ message: 'complete' });
    } catch (error) {
        console.error(error);
        res.status(200).json({
            message: 'error',
            err_message: error.message
        });
    }
}
module.exports.pop_like = async (req, res) => {
    try {
        const track_id = req.body.track_id;
        const user_id = req.user.user_id;
        const user_ = await user_model.findById(user_id);
        const idx = user_.likes.indexOf(track_id);
        user_.likes.splice(idx, 1);
        await user_.save();
        res.status(200).json({ message: 'remove-complete' });
    } catch (error) {
        console.error(error);
        res.status(200).json({
            message: 'error',
            err_message: error.message
        });
    }
}

module.exports.like_removing = async (req, res) => {
    try {
        const track_id = req.body.track_id;
        const user_id = req.user.user_id;
        const user_ = await user_model.findById(user_id);
        const idx = user_.likes.indexOf(track_id);
        user_.likes.splice(idx, 1);
        await user_.save();
        res.status(200).json({
            message: 'like removing success'
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
