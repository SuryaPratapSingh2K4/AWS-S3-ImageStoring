import React from 'react'
import Navbar from '../components/Navbar'
import { useState } from 'react'
import { useEffect } from 'react';
function PostCollection() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:7000/api/posts');
                const data = await res.json();
                setPosts(data);
                console.log("posts", data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])
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
                        <div className="p-4">
                            <p className="text-gray-800 font-medium">
                                {post.caption || "No caption"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PostCollection
