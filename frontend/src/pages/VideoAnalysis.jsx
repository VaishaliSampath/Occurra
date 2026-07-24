import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiPlay, FiFilm, FiActivity, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { analyzeVideo, getApiBaseUrl } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VideoAnalysis = ({
  latestAnalysis,
  onAnalysisComplete,
  clearLatestAnalysis
}) => {
  const [file, setFile] = useState(null);
  const [rawVideoUrl, setRawVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [liveOccupancy, setLiveOccupancy] = useState(0);
  const [playbackTime, setPlaybackTime] = useState('00:00');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const processedVideoRef = useRef(null);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (rawVideoUrl) URL.revokeObjectURL(rawVideoUrl);
    };
  }, [rawVideoUrl]);

  // Sync occupancy count with processed video playback time
  const handleTimeUpdate = () => {
    if (!processedVideoRef.current || !latestAnalysis || !latestAnalysis.occupancyTrend) return;

    const currentTime = processedVideoRef.current.currentTime;
    const totalSeconds = Math.floor(currentTime);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    setPlaybackTime(formattedTime);

    // Search trend array for matching second
    const match = latestAnalysis.occupancyTrend.find((item) => item.time === formattedTime);
    if (match) {
      setLiveOccupancy(match.occupancy);
    } else {
      // Find the closest second
      const trend = latestAnalysis.occupancyTrend;
      if (trend.length > 0) {
        // Fallback to closest element
        const closest = trend.reduce((prev, curr) => {
          const parseSec = (tStr) => {
            const [m, s] = tStr.split(':').map(Number);
            return m * 60 + s;
          };
          const prevDiff = Math.abs(parseSec(prev.time) - totalSeconds);
          const currDiff = Math.abs(parseSec(curr.time) - totalSeconds);
          return currDiff < prevDiff ? curr : prev;
        });
        setLiveOccupancy(closest.occupancy);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    processSelectedFile(selected);

    // Allow selecting the same file again later
    e.target.value = "";
  };

  const processSelectedFile = (selectedFile) => {
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['mp4', 'avi', 'mov'].includes(ext)) {
      alert("Invalid format! Please upload an MP4, AVI, or MOV file.");
      return;
    }
    setFile(selectedFile);
    setRawVideoUrl(URL.createObjectURL(selectedFile));
  };

  const handleStartAnalysis = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload raw file to API
      const result = await analyzeVideo(file, (percent) => {
        setUploadProgress(percent);
      });

      // API call finishes successfully
      onAnalysisComplete(result, file.name);
    } catch (err) {
      alert("Analysis failed. Make sure the backend server is running and the video format is correct.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Video Analysis</h2>
        <p className="text-sm text-slate-400 mt-1">
          Upload raw CCTV streams to execute the YOLO + ByteTrack tracking pipeline.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-10"
          >
            <LoadingSpinner uploadProgress={uploadProgress} />
          </motion.div>
        ) : !latestAnalysis || (file && !isUploading && rawVideoUrl && latestAnalysis.fileName !== file.name) ? (
          /* File selection and pre-upload interface */
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`glass-panel border-2 border-dashed rounded-2xl p-12 text-center flex flex-col justify-center items-center transition-all ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".mp4,.avi,.mov"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 rounded-full bg-slate-800/40 flex items-center justify-center border border-slate-700/50 mb-4">
                <FiUploadCloud className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Drag & drop surveillance stream</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
                Supports video streams in MP4, AVI, or MOV format. Ideal duration: 10 - 60 seconds.
              </p>
              <button
                onClick={triggerFileSelect}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
              >
                Choose Local File
              </button>
            </div>

            {/* Selected File Overview & Trigger */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <FiFilm className="text-blue-400" />
                  <span>Selected Video stream</span>
                </h3>
                {file ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
                      <p className="text-xs font-semibold text-slate-400">File Name</p>
                      <p className="text-sm font-bold text-white truncate mt-1">{file.name}</p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">File Size</p>
                          <p className="text-xs text-slate-300 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Format</p>
                          <p className="text-xs text-slate-300 mt-0.5 uppercase">{file.name.split('.').pop()}</p>
                        </div>
                      </div>
                    </div>
                    {rawVideoUrl && (
                      <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-black relative">
                        <video src={rawVideoUrl} controls className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <FiPlay className="w-12 h-12 stroke-[1] mb-2" />
                    <p className="text-xs font-medium">Select a video stream to preview here.</p>
                  </div>
                )}
              </div>

              {file && (
                <button
                  onClick={handleStartAnalysis}
                  className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Execute AI Vision Pipeline</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Analysis Complete screen: side-by-side player and telemetry */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Success Summary Header */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3.5">
                <FiCheckCircle className="w-7 h-7 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Pipeline Execution Completed</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Analyzed: <span className="font-semibold text-slate-300">{latestAnalysis.fileName}</span> (Hash detected).
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Processing Time</span>
                  <span className="text-xs font-extrabold text-blue-400">{latestAnalysis.processingTime} seconds</span>
                </div>
                <button
                  onClick={() => {
                    clearLatestAnalysis();

                    setFile(null);
                    setRawVideoUrl('');
                    setLiveOccupancy(0);
                    setPlaybackTime("00:00");

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold border border-slate-700/50 transition"
                >
                  Upload New Stream
                </button>
              </div>
            </div>

            {/* Video Streams Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Raw Video Container */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-md font-bold text-white flex items-center space-x-2">
                  <FiFilm className="text-slate-500" />
                  <span>Raw Surveillance Stream</span>
                </h3>
                <div className="rounded-xl overflow-hidden border border-slate-900 bg-black aspect-video flex items-center justify-center">
                  {rawVideoUrl ? (
                    <video src={rawVideoUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-xs text-slate-500 font-semibold p-10 text-center">
                      Raw source buffer cleared.
                    </div>
                  )}
                </div>
              </div>

              {/* Processed Video Container */}
              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 relative">
                {/* Live Count Float Badge */}
                <div className="absolute top-8 right-8 z-10 flex items-center space-x-3 bg-slate-950/85 backdrop-blur border border-blue-500/30 px-3.5 py-1.5 rounded-xl shadow-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Telemetry: <span className="text-xs font-extrabold text-white ml-1">{liveOccupancy} Person(s)</span>
                  </div>
                </div>

                <h3 className="text-md font-bold text-white flex items-center space-x-2">
                  <FiActivity className="text-blue-400 animate-pulse" />
                  <span>AI Processed Stream (YOLO + ByteTrack)</span>
                </h3>

                <div className="rounded-xl overflow-hidden border border-slate-900 bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={processedVideoRef}
                    src={`${getApiBaseUrl()}${latestAnalysis.processedVideo}`}
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Live Playback Telemetry Details */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Playback Frame Time</span>
                <p className="text-lg font-bold text-white">{playbackTime}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Frame Count</span>
                <p className="text-lg font-bold text-blue-400">{liveOccupancy} Person(s)</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Peak Occupancy</span>
                <p className="text-lg font-bold text-amber-400">{latestAnalysis.peakOccupancy} Person(s)</p>
              </div>
              <div className="space-y-1 col-span-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Zone Profile Status</span>
                <span className="block text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-max mt-1 uppercase tracking-wide">
                  Analysis Active
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoAnalysis;
