import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  get_userdatabyname,
  getpostdata,
  updatepost,
} from "../service/Auth/database";
import { Post } from "./post";
import Navbar from "./navbar";
import { auth } from "../service/Auth";
import Suggestion from "./suggestion";
import ProgressBar from "@badrap/bar-of-progress";
import { RotatingLines } from "react-loader-spinner";
import Createid from "../service/other/createid";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Comment from "./comment";
import { useuserdatacontext } from "../service/context/usercontext";

export default function Seepost() {
  const { username, postid } = useParams();
  const progress = new ProgressBar();
  const { userdata, defaultprofileimage } = useuserdatacontext();
  const [post, setpost] = useState([]);
  const navigate = useNavigate();
  const [commenttext, setcommenttext] = useState("");
  const [loader, setloader] = useState(true);

  useEffect(() => {
    const data = async () => {
      progress.start();
      setpost(await getpostdata(username, postid));
      progress.finish();
      setloader(false);
    };

    data();
  }, []);

  useEffect(() => {
    const data = async () => {
      if (post != [null]) {
        await updatepost(post, post?.postedby);
      }
    };
    data();
  }, [post]);

  const handelcomment = () => {
    if (auth?.currentUser && commenttext != "") {
      setpost((prev) => ({
        ...prev,
        comments: [
          ...prev?.comments,
          {
            content: commenttext,
            postedby: userdata?.uid,
            postedat: new Date(),
            commentid: Createid(),
            likes: [],
          },
        ],
      }));
    }
  };

  return (
    <div className="flex w-full justify-around h-screen scroll-hidden ">
      <Navbar />
      {loader && (
        <div className="absolute h-screen flex justify-center align-middle my-auto">
          <RotatingLines
            visible={true}
            height="96"
            width="96"
            color="#1E90FF"
            strokeWidth="4"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      )}

      {post === undefined && (
        <div className="w-full capitalize text-center text-base flex flex-col h-screen ">
          <div className="my-auto ">
            <p>
              Hmm...this page doesn’t exist. Try searching for something else.
            </p>
            <button
              onClick={() => {
                navigate("/home");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-sm rounded-full my-5  mx-auto text-white text-center p-2 sm:px-4 capitalize  md:w-40"
            >
              search
            </button>
          </div>
        </div>
      )}

      {!loader && post && (
        <div className="w-full flex flex-col">
          <div className="flex  bg-black  capitalize space-x-4 ">
            <i
              onClick={() => {
                navigate("/home");
              }}
            >
              <ArrowBack />
            </i>
            <label className=" text-2xl ">post</label>
          </div>
          {post !== null && <Post postdata={post} popup={false} />}
          {post !== null && (
            <div className="flex text-center flex-col container ">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handelcomment();
                  setcommenttext("");
                }}
                className="flex w-full my-2 border  rounded-xl border-neutral-500 p-4 justify-around"
              >
                <img
                  src={userdata?.profileImageURL || defaultprofileimage}
                  className="w-10 h-10  border-2 bg-gray-400 border-neutral-400  rounded-full"
                  alt=""
                />
                <input
                  onChange={(e) => {
                    setcommenttext(e.target.value);
                  }}
                  value={commenttext}
                  maxLength={50}
                  type="text"
                  className="mx-2 w-full bg-black capitalize text-white text-base border-2 px-4 border-white rounded-xl "
                  placeholder="write a comment .."
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-sm  text-white text-center p-2 sm:px-4 capitalize rounded-md  md:w-40">
                  comment
                </button>
              </form>
              <h2 className="sm:text-xl text-base my-3 text-center p-2 capitalize w-3/4 m-auto text-gray-400">
                {" "}
                {post?.comments?.length > 0
                  ? "comments"
                  : "Don't be shy! , Your opinion is valuable share it with us in the comments."}
              </h2>

              <div className="flex space-y-5 flex-col my-5 ">
                {post?.comments?.map((comm, index) => {
                  return (
                    <div className="flex flex-col space-y-5 ">
                      <Comment
                        setpost={setpost}
                        key={index}
                        currentcomment={comm}
                        post={post}
                      />
                      <hr className="w-full border-gray-700" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="w-1/4 hidden md:block">
        <Suggestion />
      </div>
    </div>
  );
}