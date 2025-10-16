import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

function PostCollection() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [updatedCaption, setUpdatedCaption] = useState("");
    const [updatedImage, setUpdatedImage] = useState(null);

    // Fetch all posts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:7000/api/posts");
                const data = await res.json();
                setPosts(data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Delete post
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(`http://localhost:7000/api/delete/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setPosts((prev) => prev.filter((p) => p._id !== id));
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    // Start editing
    const handleEditClick = (post) => {
        setEditingPost(post._id);
        setUpdatedCaption(post.caption);
        setUpdatedImage(null);
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setEditingPost(null);
        setUpdatedCaption("");
        setUpdatedImage(null);
    };

    // Save updated caption and/or image
const handleUpdate = async (id) => {
    try {
        const formData = new FormData();
        formData.append("caption", updatedCaption);
        if (updatedImage) formData.append("image", updatedImage);

        const res = await fetch(`http://localhost:7000/api/update/${id}`, {
            method: "PUT",
            body: formData,
        });

        if (res.ok) {
            // const updated = await res.json();

            // Fetch fresh signed URL for updated image
            const fetchPosts = async () => {
                const postsRes = await fetch("http://localhost:7000/api/posts");
                const postsData = await postsRes.json();
                setPosts(postsData);
            };
            await fetchPosts();

            handleCancelEdit();
        } else {
            console.error("Failed to update post");
        }
    } catch (error) {
        console.error("Error updating post:", error);
    }
};


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-xl">
                Loading posts...
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="max-w-6xl mx-auto py-10 px-4 grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                {posts.length === 0 && (
                    <p className="text-center col-span-full text-gray-500">
                        No posts available.
                    </p>
                )}

                {posts.map((post) => (
                    <div
                        key={post._id}
                        className="bg-white shadow-lg rounded-lg overflow-hidden border hover:shadow-xl transition-shadow"
                    >
                        <img
                            src={post.imageURL}
                            alt={post.caption || "No caption"}
                            className="w-full h-56 object-cover"
                        />
                        <div className="p-4 flex flex-col gap-2">
                            {editingPost === post._id ? (
                                <>
                                    <input
                                        type="text"
                                        value={updatedCaption}
                                        onChange={(e) => setUpdatedCaption(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setUpdatedImage(e.target.files[0])}
                                        className="border p-2 rounded w-full bg-base-100"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleUpdate(post._id)}
                                            className="bg-green-500 text-white py-1 px-3 rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="bg-gray-400 text-white py-1 px-3 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-800 font-medium">
                                            {post.caption || "No caption"}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(post)}
                                            className="bg-blue-500 text-white py-1 px-3 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="bg-red-500 text-white py-1 px-3 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PostCollection;
