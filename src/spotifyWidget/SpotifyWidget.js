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

    let title = "";

    if (nowPlaying != null && nowPlaying.title) {
        title = nowPlaying.title;
    }

    return (
        <div className="">
            <div class="w-full max-w-[320px] mx-auto bg-white shadow-md rounded-lg overflow-hidden dark:bg-zinc-900">
                <div class="flex justify-between items-center px-6 py-4">
                    <div class="flex items-center">
                        <svg
                            class="h-6 w-6 text-yellow-500"
                            fill="none"
                            height="24"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                        <div class="mx-3">
                            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-200">
                                {title}
                            </h3>
                            <p class="text-gray-500 dark:text-gray-400">
                                Dibbya Subba
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <svg
                            class="h-6 w-6 text-red-500"
                            fill="none"
                            height="24"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                        <svg
                            class="h-6 w-6 text-gray-500 dark:text-gray-400 ml-4"
                            fill="none"
                            height="24"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </div>
                </div>
                <div class="relative">
                    <div class="absolute inset-0 flex items-center justify-center"></div>
                </div>
                <div class="px-6 py-4">
                    <div class="flex items-center">
                        <svg
                            class="h-5 w-5 text-gray-500 dark:text-gray-400"
                            fill="none"
                            height="24"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        </svg>
                        <div class="w-full mx-3">
                            <div class="relative mt-1 h-1 bg-gray-200 rounded overflow-hidden dark:bg-gray-800">
                                <div class="absolute left-0 top-0 h-full bg-yellow-500 w-1/2"></div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            50%
                        </p>
                    </div>
                    <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-3">
                        <span> 00:03 </span>
                        <span> 3:35 </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpotifyWidget;
