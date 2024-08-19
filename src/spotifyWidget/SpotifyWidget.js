import { Buffer } from "buffer";
import querystring from "querystring";
import React, { useEffect, useState } from "react";

//Setting up the Spotify API and Endpoints
const NOW_PLAYING_ENDPOINT = process.env.REACT_APP_NOW_PLAYING_ENDPOINT;
const TOKEN_ENDPOINT = process.env.REACT_APP_TOKEN_ENDPOINT;
const client_id = process.env.REACT_APP_CLIENT_ID;
const client_secret = process.env.REACT_APP_CLEINT_SECRET_KEY;
const refresh_token = process.env.REACT_APP_REFRESH_TOKEN;

//Function to generate an access token using the refresh token everytime the website is opened or refreshed
export const getAccessToken = async (
    client_id,
    client_secret,
    refresh_token
) => {
    //Creates a base64 code of client_id:client_secret as required by the API
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString(
        "base64"
    );

    //The response will contain the access token
    const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: querystring.stringify({
            grant_type: "refresh_token",
            refresh_token,
        }),
    });

    return response.json();
};

//Uses the access token to fetch the currently playing song
export const getNowPlaying = async () => {
    try {
        //Generating an access token
        const { access_token } = await getAccessToken(
            client_id,
            client_secret,
            refresh_token
        );

        //Fetching the response
        const response = await fetch(NOW_PLAYING_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        //If response status > 400 means there was some error while fetching the required information
        if (response.status > 400) {
            throw new Error("Unable to Fetch Song");
        } else if (response.status === 204) {
            //The response was fetched but there was no content
            throw new Error("Currently Not Playing");
        }

        //Extracting the required data from the response into seperate variables
        const song = await response.json();
        const albumImageUrl = song.item.album.images[0].url;
        const artist = song.item.artists
            .map((artist) => artist.name)
            .join(", ");
        const isPlaying = song.is_playing;
        const songUrl = song.item.external_urls.spotify;
        const title = song.item.name;
        const timePlayed = song.progress_ms;
        const timeTotal = song.item.duration_ms;
        const artistUrl = song.item.album.artists[0].external_urls.spotify;

        //Returning the song details
        return {
            albumImageUrl,
            artist,
            isPlaying,
            songUrl,
            title,
            timePlayed,
            timeTotal,
            artistUrl,
        };
    } catch (error) {
        console.error("Error fetching currently playing song: ", error);
        return error.message.toString();
    }
};

const SpotifyWidget = () => {
    const [nowPlaying, setNowPlaying] = useState(null);

    useEffect(() => {
        const fetchNowPlaying = async () => {
            const data = await getNowPlaying();
            console.log(data);
            setNowPlaying(data);
        };

        //The spotify API does not support web sockets, so inorder to keep updating the currently playing song and time elapsed - we call the API every second
        setInterval(() => {
            fetchNowPlaying();
        }, 1000);
    }, []);

    return <div className="">SpotifyWidget</div>;
};

export default SpotifyWidget;
