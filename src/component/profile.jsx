import React, { useState, useEffect } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { Post } from './post';
import EditIcon from '@mui/icons-material/Edit';
import { Popupitem } from '../ui/popup';
import { useuserdatacontext } from '../service/context/usercontext';
import { check_username_is_exist, get_userdatabyname, updateprofileuserdata } from '../service/Auth/database';
import { toast } from 'react-toastify';
import { Skeleton } from '@mui/material';
import LinkedCameraIcon from '@mui/icons-material/LinkedCamera';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import { Createpost } from './createpost';
import { Getimagedownloadlink } from '../service/Auth/database'
import { auth } from '../service/Auth';
import Profileviewbox from './profileviewbox';
import ProgressBar from "@badrap/bar-of-progress";


export const Profile = ({ username }) => {
    const progress = new ProgressBar();
    const [profileuserdata, setprofileuserdata] = useState(null)
    const navigate = useNavigate()
    const { userdata, defaultprofileimage, setuserdata } = useuserdatacontext()
    const [active, setactive] = useState('')
    const [isusernameexist, setisusernameexist] = useState(false)

    const [editformdata, seteditformdata] = useState(userdata)
    const [profileimage, setprofileimage] = useState(null)
    const [profileimgurl, setprofileimgurl] = useState(userdata?.profileImageURL)


    const handelchange = (e) => {
        const { name, value } = e.target;
        seteditformdata(prevData => ({ ...prevData, [name]: value.trim() }))
    }


    useEffect(() => {
        const data = async () => {
            if (auth.currentUser && userdata?.username !== profileuserdata?.username && profileuserdata !== null) {
                await updateprofileuserdata(profileuserdata, username)
                console.log('user updated')
            }
            else if (userdata?.username === profileuserdata?.username) {
                setuserdata(profileuserdata)
            }

        }
        data()
    }, [profileuserdata])



    useEffect(() => {
        const data = async () => {
            progress.start()

            const profile = await get_userdatabyname(username)
            setprofileuserdata(profile);
            setactive('')
            progress.finish()
        }
        data()

    }, [username])

    const handelfollow = () => {
        if (auth.currentUser) {
            profileuserdata?.follower?.includes(userdata?.uid) ? setprofileuserdata(prev => ({ ...prev, 'follower': profileuserdata?.follower.filter((e) => e !== userdata?.uid) })) : setprofileuserdata(prev => ({ ...prev, 'follower': [...prev?.follower, userdata?.uid] }))

            !userdata?.following.includes(profileuserdata?.uid) ? setuserdata(prev => ({ ...prev, 'following': [...prev.following, profileuserdata?.uid] })) : setuserdata(prev => ({ ...prev, 'following': userdata?.following.filter((e) => e !== profileuserdata?.uid) }))
        }
        else {
            navigate('/login')
        }

    }
    return (
        <div className='overflow-y-scroll scroll-hidden h-screen w-full p-2 text-2xl capitalize'>
            <div className="flex relative m-1 sm:m-2 ">
                <i onClick={() => {
                    navigate('/home')
                }}><ArrowBackIcon /></i>
                <div className='flex flex-col mx-4 capitalize'>
                    <label>{profileuserdata?.name || <Skeleton animation="wave" sx={{ bgcolor: 'grey.900' }} variant="text" width={150} />}</label>
                    <label className='text-gray-500 text-base' >{profileuserdata?.post.length} Postes</label>
                </div>
                <i className='ml-auto' onClick={() => { active === 'setting' ? setactive('') : setactive('setting') }}><MoreVertIcon /></i>
                {active === 'setting' && <div className='absolute top-12 right-3  sm:right-8 px-4 text-sm bg-black z-50 sm:-my-10 -my-2 py-5 p-3  rounded-xl shadow-sm shadow-white flex flex-col space-y-4  '>

                    <button className='w-40 capitalize  p-1 rounded-full hover:bg-gray-950 ' onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('copied to clipboard')
                        setactive('')

                    }}>copy profile link </button>

                    <button className='w-40 capitalize  p-1 rounded-full hover:bg-gray-950  ' onClick={() => {

                    }}>about this account </button>
                    {profileuserdata?.username !== userdata?.username ? <>
                        <button className='w-40 capitalize  p-1 rounded-full text-red-500 hover:bg-gray-950' onClick={() => {

                        }}>report </button>
                        <button className='w-40 capitalize  p-1 rounded-full hover:bg-gray-950 text-red-500 ' onClick={() => {

                        }}>block </button>
                    </> : <>
                        <button className='w-40 capitalize  p-1 rounded-full  hover:bg-gray-950' onClick={() => {

                        }}>account settings </button>
                    </>
                    }
                </div>}
            </div>
            <div className='flex'>
                <div className="sm:my-10 space-y-3 flex flex-col text-left m-5">
                    <img src={profileuserdata?.profileImageURL || defaultprofileimage} alt={defaultprofileimage} className="sm:w-28 sm:h-28 h-20 w-20 bg-gray-300 rounded-full  border-4 border-neutral-600" />
                    <div className="flex flex-col ">
                        <label className='my-1 font-semibold'>{profileuserdata?.name || <Skeleton animation="wave" sx={{ bgcolor: 'grey.900' }} variant="text" width={150} />}</label>
                        <label className='text-xl text-gray-400'>@{profileuserdata?.username || <Skeleton animation="wave" sx={{ bgcolor: 'grey.900' }} variant="text" width={150} />}</label>
                    </div>
                    <pre className="  text-base sm:text-lg">{profileuserdata?.bio}</pre>
                    <div className="flex space-x-3 text-lg text-gray-400">
                        <label onClick={() => {
                            profileuserdata?.follower.length > 0 && setactive('followers')
                        }}>{profileuserdata?.follower.length} follower</label>
                        <label onClick={() => {
                            profileuserdata.following.length > 0 && setactive('following')
                        }}>{profileuserdata?.following.length} following</label>
                    </div>
                </div>
                {profileuserdata?.username === userdata?.username ?
                    <div className={`${userdata?.username ? 'block' : 'hidden'} cursor-pointer mr-5 ml-auto`}>
                        <button title='edit profile' onClick={() => {
                            active === 'edit' ? setactive('') : setactive("edit")
                            seteditformdata(userdata)
                        }}
                            className='bg-black border-2 relative top-1/3 sm:mr-10 text-xs sm:text-lg  border-sky-200 sm:px-3 p-2 font-semibold capitalize rounded-3xl ml-auto  '><span className='flex justify-center sm:justify-start  '><EditIcon /><label className='sm:block hidden mx-2' >edit profile</label></span></button>
                    </div>
                    :
                    <div className={`${userdata?.username ? 'block' : 'hidden'} cursor-pointer mr-5 ml-auto`}>
                        <button title='follow' onClick={() => { handelfollow() }} className='bg-black border-2 relative top-1/3 sm:mr-10 text-xs sm:text-lg mr-2  border-sky-200 sm:px-3 p-2 font-semibold capitalize rounded-3xl ml-auto  '><label className='mx-2' >{profileuserdata?.follower.includes(userdata?.uid) ? <>following</> : <>follow</>}</label></button>
                    </div>}

            </div>

            <hr />

            {!profileuserdata?.username && <div className='text-center my-10 font-serif text-2xl border-b border-gray-500 p-5 mx-5  '>profile doesnot exist</div>}

            <div className="">
                {profileuserdata?.post == [null] ? <div className='text-2xl capitalize text-center'>no post</div> : <>{profileuserdata?.post.map((item, index) => {
                    return <div key={index} className="">
                        <Post index={index} postdata={item} popup={true} />
                        <hr />
                    </div>
                })}</>}
            </div>


            {active === 'followers' && <div>
                {<Popupitem closefunction={() => {
                    setactive('')

                }} >
                    <div className="flex flex-col justify-center align-middle space-y-3">
                        <h2 className='text-center text-3xl '>followers</h2>
                        {profileuserdata?.follower.map((profile) => {
                            return <Profileviewbox profileusername={profile} />
                        })}
                    </div>
                </Popupitem>}
            </div>}

            {active === 'following' && <div>
                {<Popupitem closefunction={() => {
                    setactive('')

                }} >
                    <div className="flex flex-col justify-center align-middle space-y-3">
                        <h2 className='text-center text-3xl '>following</h2>
                        {profileuserdata?.following.map((profile) => {
                            return <Profileviewbox profileusername={profile} />
                        })}
                    </div>
                </Popupitem>}
            </div>}


            {active === 'edit' && <div>
                <Popupitem closefunction={() => {
                    setactive('')
                    setisusernameexist(false)

                }}>
                    <div className="text-center m-auto w-1/4 sm:w-40 font-semibold font-serif capitalize my-2 border-b-2 pb-4 border-white">
                        <h2>edit profile</h2>
                    </div>
                    <form className='flex flex-col ' onSubmit={async (e) => {
                        e.preventDefault();

                        if (profileimage) {
                            try {
                                const data = await Getimagedownloadlink(profileimage, auth.currentUser.uid);
                                await seteditformdata(prevData => ({ ...prevData, 'profileImageURL': data }));
                                console.log(userdata, editformdata)
                                if (!isusernameexist && userdata !== editformdata) {
                                    setuserdata(editformdata);
                                }
                                setactive('');
                                setprofileimgurl(editformdata?.profileImageURL);
                                toast.success("Updated successfully");
                            } catch (error) {
                                console.error("Error fetching image download link:", error);
                                setactive("")
                                toast.error("Failed to update profile");
                            }
                        }
                        else {
                            if (!isusernameexist && userdata !== editformdata) {
                                seteditformdata(userdata)
                                setuserdata(editformdata);
                                setactive('');
                                setprofileimgurl(editformdata.profileImageURL);
                                toast.success("Updated successfully");
                            }
                        }

                    }}>
                        <div className='my-5 flex flex-col m-auto'>
                            <img title='click to change the profile photo' className='w-28 object-fill h-28 border-1 bg-gray-900 opacity-90 p-2 m-auto rounded-full' src={profileimgurl} alt="logo" />
                            <i onClick={() => {
                                document.getElementById('file').click()
                            }} className=' left-4 z-10 text-black m-auto -mt-16 sticky'><LinkedCameraIcon /></i>
                            <input type="file" accept='image/*' onChange={async (e) => {
                                setprofileimgurl(URL.createObjectURL(e.target.files[0]))
                                setprofileimage(e.target.files[0])

                            }} name="profileImageURL" id="file" className='hidden' />
                        </div>
                        <div className="flex-col flex my-2">
                            <label autoFocus className="md:text-xl text-base font-sans p-2 mx-3 border-b-2 border-gray-800" > username</label>
                            <input type="text" name='username' placeholder="enter your unique uername..."
                                minLength={6}
                                value={editformdata?.username} className='px-5 placeholder:capitalize bg-black   border-2 border-gray-300 placeholder:font-serif placeholder:text-neutral-500   md:text-lg text-sm p-2 border-1   rounded-2xl my-2 ' onChange={async (e) => {
                                    handelchange(e)
                                    const data = await check_username_is_exist(e.target.value.trim())
                                    const isValidInput = /^[a-z0-9]+$/.test(e.target.value.trim())

                                    if (data[1] || !isValidInput) {
                                        setisusernameexist(true)
                                        e.target.style.borderColor = 'red'
                                    }
                                    else {
                                        setisusernameexist(false)
                                        e.target.style.borderColor = 'white'
                                    }
                                }} required></input>

                        </div>

                        {isusernameexist && <label className="text-red-400 mx-3 text-base capitalize">invalid username or already exist</label>}

                        <div className="flex-col flex my-2">
                            <label className="md:text-xl border-b-2 border-gray-800  text-base font-sans p-2 mx-3 " > full name </label>

                            <input type="text" name='name' placeholder="full name..." value={editformdata?.name} className='px-5 placeholder:capitalize bg-black   border-2 border-gray-300 placeholder:font-serif placeholder:text-neutral-500   md:text-lg text-sm p-2 border-1   rounded-2xl my-2  ' onChange={handelchange} required></input>

                        </div>

                        <div className="flex-col flex my-2">
                            <label className="md:text-xl text-base  font-sans p-2 mx-3 border-b-2 border-gray-800  " > date of birth</label>

                            <input aria-invalid={!([editformdata].age > new Date() || editformdata?.age < new Date('1970-1-1'))} type="date" name='age' value={editformdata?.dateofbirth} className='px-5 placeholder:capitalize bg-black   border-2 border-gray-300 placeholder:font-serif w-full placeholder:text-neutral-500     md:text-lg text-sm p-2 border-1   rounded-2xl my-2   ' onChange={handelchange} required></input>

                        </div>
                        <div className="flex-col  flex my-2">
                            <label className="md:text-xl text-base  font-sans p-2 mx-3 border-b-2 border-gray-800  " >bio</label>

                            <textarea type="text" name='bio' placeholder="write about your exprience , your favirate topics and many more about you " value={editformdata?.bio} className='px-5 placeholder:capitalize bg-black -white  border-2 border-gray-300  capitalize placeholder:font-serif placeholder:text-neutral-500  md:text-lg text-sm p-2 border-1   rounded-2xl my-2  ' onChange={handelchange} ></textarea>

                        </div>
                        <button type="submit" className='rounded-2xl text-lg md:text-xl border-white my-6 p-2 mr-auto md:px-7 border-1 capitalize bg-sky-600 hover:scale-105 transition-all m-auto ease'>edit profile</button>
                    </form>


                </Popupitem>


            </div>}
            {profileuserdata?.post.length === 0 &&
                <>{profileuserdata?.username !== userdata?.username ? <div className='w-full my-12 flex flex-col justify-center'>
                    <i className='rounded-full m-auto text-zinc-800 border-2 border-stone-700 p-3  flex justify-center '><CameraEnhanceIcon /></i>
                    <h1 className="text-3xl font-bold text-center my-2">
                        no post yet
                    </h1>
                </div> : <div className='w-full my-20 flex flex-col  justify-center'>
                    <i className='rounded-full m-auto text-zinc-800 scale-125 border-2 border-stone-700 p-3  my-2 flex justify-center '><CameraEnhanceIcon /></i>
                    <h1 className="sm:text-3xl text-lg font-bold text-center my-1">
                        share your first post
                    </h1>
                    <button onClick={() => { setactive('post') }} className='rounded-2xl text-lg md:text-xl px-10 border-white my-5 p-2 mr-auto  border-1 capitalize bg-sky-600 hover:scale-105 transition-all m-auto ease'>post</button>
                </div>}</>
            }
            {active === 'post' && <Popupitem closefunction={() => { setactive('') }}>
                <div className="my-5">
                    <Createpost toggle={() => { setactive('') }} />
                </div>
            </Popupitem>}
        </div>
    )
}
