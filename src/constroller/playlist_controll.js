const playlist_model = require("../model_user/playlist_model");
const track_model = require("../model_user/track_model");
const user_model = require("../model_user/user_model");

// Function to handle playlist management actions
module.exports.playlist_MA = (req, res) => {
    try {
        const { list_data, track_id } = req.body;
        const user_id = req.user.user_id;
        list_data.forEach(async (element) => {
            if (element.state === 'new') {
                // create new playlist 
                await createPlaylist(element.name, track_id, user_id);
            }
            else {
                if (element.playlist_state) {
                    // add track(track_id) to playlist 
                    await updatePlaylist(element.list_id, track_id);
                }
                else {
                    // remove track(track_id) from playlist
                    await removeTrack(element.list_id, track_id);
                }
            }
        });
        res.status(200).json({ message: 'update list data success' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'we get some error from sever at : api/user/playlist/update',
            err_message: err
        })
    }
}

// Function to display playlists
module.exports.display_List = async (req, res) => {
    try {
        const { track_id } = req.query;
        const user_id = req.user.user_id;
        const user = await user_model.findById(user_id);
        let playlists = [];
        if (user.lists.length > 0) {
            for (const list of user.lists) {
                const item = await getPlaylist(list, track_id);
                playlists.push(item);
            };
            res.status(200).json({
                message: 'user playlists',
                playlists: playlists
            });
        }
        else {
            res.status(200).json({
                message: 'user has no playlists',
                playlists: []
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Function to remove a playlist from the user's list
module.exports.remove_List = async (req, res) => {
    try {
        const { list_id } = req.body;
        const user_id = req.user.user_id;
        const user = await user_model.findById(user_id);
        if (user.lists.includes(list_id)) {
            const idx = user.lists.indexOf(list_id);
            user.lists.splice(idx, 1);
            await user.save();
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports.display_List_item = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        let lists = [];
        const user_ = await user_model.findById(user_id);
        if (user_.lists) {
            for (let item of user_.lists) {
                const list = await get_eachPlaylist(item);
                lists.push(list);
            }
            res.status(200).json({
                message: 'success',
                list_data: lists
            });
        }
        else {
            res.status(200).json({
                message: 'success',
                list_data: []
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports.display_tracks_list = async (req, res) => {
    try {
        const { list_id } = req.query;
        let arr = [];
        const list_ = await playlist_model.findById(list_id);
        for (let item of list_.tracks) {
            const track = await track_model.findById(item);
            arr.push(track);
        }
        res.status(200).json({
            message: 'getting tracks in playlist success',
            list_data: arr
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
module.exports.reomve_List_item = async (req, res) => {
    try {
        const { list_id } = req.body;
        const user_id = req.user.user_id;
        await playlist_model.findByIdAndDelete(list_id);
        const user_ = await user_model.findById(user_id);
        const idx = user_.lists.indexOf(list_id);
        user_.lists.splice(idx, 1);
        await user_.save();
        res.status(200).json({ message: 'removing success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


// Helper functions for playlist management
async function createPlaylist(name, track_id, user_id) {
    const new_data = await playlist_model.insertOne({
        name: name,
        owner: user_id,
    })
    const user = await user_model.findById(user_id);
    new_data.tracks.push(track_id);
    user.lists.push(new_data._id);
    await new_data.save();
    await user.save();
}

async function updatePlaylist(list_id, track_id) {
    const playlist = await playlist_model.findById(list_id);
    playlist.tracks.push(track_id);
    await playlist.save();
}

async function removeTrack(list_id, track_id) {
    const playlist = await playlist_model.findById(list_id);
    if (playlist.tracks.includes(track_id)) {
        const idx = playlist.tracks.indexOf(track_id);
        playlist.tracks.splice(idx, 1);
        await playlist.save();
    }

}

async function getPlaylist(list_id, track_id) {
    const playlist = await playlist_model.findById(list_id);
    let list_state = false;
    if (playlist.tracks.includes(track_id)) {
        list_state = true;
    }
    return {
        list_id: list_id,
        lists: playlist.name,
        state: 'database',
        playlist_state: list_state
    };
}

async function get_eachPlaylist(list_id) {
    const playlist = await playlist_model.findById(list_id);
    return {
        list_id: playlist._id,
        lists: playlist.name,
    };
}

