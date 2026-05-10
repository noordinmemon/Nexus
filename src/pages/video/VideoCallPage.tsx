import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SOCKET_URL = 'http://localhost:5000';

export const VideoCallPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Connecting...');

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!roomId || !user) return;

    // Connect to socket
    socketRef.current = io(SOCKET_URL);

    // Get local media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Join room
        socketRef.current?.emit('join-room', roomId, user.id);
        setStatus('Waiting for other participant...');
      })
      .catch(err => {
        console.error('Media error:', err);
        setStatus('Camera/microphone access denied');
      });

    // Someone joined
    socketRef.current.on('user-joined', async (socketId: string) => {
      setStatus('Participant joined. Connecting...');
      await createPeerConnection(socketId);
      const offer = await peerConnectionRef.current!.createOffer();
      await peerConnectionRef.current!.setLocalDescription(offer);
      socketRef.current?.emit('offer', offer, roomId);
    });

    // Received offer
    socketRef.current.on('offer', async (offer: RTCSessionDescriptionInit, socketId: string) => {
      await createPeerConnection(socketId);
      await peerConnectionRef.current!.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current!.createAnswer();
      await peerConnectionRef.current!.setLocalDescription(answer);
      socketRef.current?.emit('answer', answer, socketId);
    });

    // Received answer
    socketRef.current.on('answer', async (answer: RTCSessionDescriptionInit) => {
      await peerConnectionRef.current!.setRemoteDescription(answer);
      setConnected(true);
      setStatus('Connected');
    });

    // ICE candidate
    socketRef.current.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(candidate);
      } catch (err) {
        console.error('ICE error:', err);
      }
    });

    // User left
    socketRef.current.on('user-left', () => {
      setConnected(false);
      setStatus('Participant left the call');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    return () => {
      cleanup();
    };
  }, [roomId, user]);

  const createPeerConnection = async (socketId: string) => {
    peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    localStreamRef.current?.getTracks().forEach(track => {
      peerConnectionRef.current!.addTrack(track, localStreamRef.current!);
    });

    // Remote stream
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setConnected(true);
      setStatus('Connected');
    };

    // ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', event.candidate, roomId);
      }
    };
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        socketRef.current?.emit('toggle-audio', roomId, audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        socketRef.current?.emit('toggle-video', roomId, videoTrack.enabled);
      }
    }
  };

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    peerConnectionRef.current?.close();
    socketRef.current?.emit('leave-room', roomId);
    socketRef.current?.disconnect();
  };

  const endCall = () => {
    cleanup();
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Status bar */}
      <div className="bg-gray-800 text-white text-center py-2 text-sm">
        {status}
      </div>

      {/* Video area */}
      <div className="flex-1 relative p-4">
        {/* Remote video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-lg bg-gray-800"
        />

        {/* Local video */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-8 right-8 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg"
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-800 py-6 flex justify-center gap-6">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${audioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
        >
          {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          <PhoneOff size={24} />
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${videoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
        >
          {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
      </div>
    </div>
  );
};