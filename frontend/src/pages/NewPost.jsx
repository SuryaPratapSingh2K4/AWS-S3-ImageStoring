import React from 'react'
import Navbar from '../components/Navbar'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
function NewPost() {
    const [caption, setCaption] = useState("")
    const [image, setImage] = useState();
    const navigate = useNavigate();
    const fileSelected = (e) => {
        const file = e.target.files[0];
        setImage(file);
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!image){
            alert('pls seelect a file');
            return;
        }
        const formatData = new FormData();
        formatData.append('image',image)
        formatData.append('caption',caption)
        try {
                const res = await fetch('http://localhost:7000/api/upload', {
                    method: 'POST',
                    // headers: {
                    //     "Content-Type": "application/json"
                    // },
                    body: formatData
                })
                if (res.ok) {
                    alert("File uploaded successfully")
                    navigate('/postcollection')
                }
            
        } catch (error) {
            console.error(error.message);

        }
    }
    return (
        <div className='min-h-screen bg-base-900'>
            <Navbar />
            <div className='flex flex-col items-center mt-8 w-full max-w-xl'>
                <div className='flex flex-col'>
                    <input type="file" onChange={fileSelected} accept='image/*' className="file-input file-input-ghost" />
                    <input type="text" placeholder='caption' value={caption} onChange={(e) => setCaption(e.target.value)} className='border px-6 py-2 mt-4' />
                    <button onClick={handleSubmit} className='border bg-base-300 mt-4 py-2 rounded-lg'>Submit</button>
                </div>
            </div>

        </div>
    )
}

export default NewPost
