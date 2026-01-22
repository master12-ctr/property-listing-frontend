'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/lib/api/services';
import toast from 'react-hot-toast';
import { formatDateLong } from '@/lib/utils/format';
import { 
  EnvelopeIcon, 
  CheckIcon, 
  TrashIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

type MessageType = 'received' | 'sent';

export default function MessagesPage() {
  const [messageType, setMessageType] = useState<MessageType>('received');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const queryClient = useQueryClient();
  const { isAdmin, isPropertyOwner } = useAuth();

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', messageType],
    queryFn: () => contactService.getMessages(messageType),
  });

  // Fetch unread count
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => contactService.getUnreadCount(),
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => contactService.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      toast.success('Message marked as read');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark as read');
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => contactService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      toast.success('Message deleted');
      setSelectedMessage(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    },
  });

  const handleMarkAsRead = async (messageId: string) => {
    if (!messageId) {
      toast.error('Invalid message ID');
      return;
    }
    await markAsReadMutation.mutateAsync(messageId);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!messageId) {
      toast.error('Invalid message ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessageMutation.mutateAsync(messageId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">
              {isAdmin ? 'Manage all system messages' : 'Manage your property inquiries'}
            </p>
          </div>
          {unreadCount?.count > 0 && (
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                {unreadCount.count} unread
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Admin-specific actions */}
      {isAdmin ? (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <UserGroupIcon className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Admin Message Management</h3>
              <p className="text-sm text-gray-600 mt-1">
                As an administrator, you can view all messages in the system.
                {isPropertyOwner && ' You can also send messages to property owners.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Send a Message</h3>
            <Link 
              href="/dashboard/properties" 
              className="btn-primary flex items-center space-x-2"
            >
              <BuildingOfficeIcon className="w-4 h-4" />
              <span>Browse Properties</span>
            </Link>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            To send a message, browse properties and use the "Contact Owner" button on any property page.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Message Type Tabs */}
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setMessageType('received')}
                  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    messageType === 'received'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {isAdmin ? 'All Messages' : 'Received'}
                </button>
                <button
                  onClick={() => setMessageType('sent')}
                  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    messageType === 'sent'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sent
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading messages...</p>
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="p-8 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No messages</h3>
                  <p className="text-gray-600 mt-1">
                    {messageType === 'received' 
                      ? 'You haven\'t received any messages yet.' 
                      : 'You haven\'t sent any messages yet.'}
                  </p>
                </div>
              ) : (
                messages.map((message: any, index: number) => (
                  <div
                    key={`${message.id || message._id || index}`}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !message.isRead && messageType === 'received' ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {messageType === 'received' 
                              ? message.fromUser?.name || 'Unknown' 
                              : message.toUser?.name || 'Unknown'}
                          </h3>
                          {!message.isRead && messageType === 'received' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {message.property?.title || 'Unknown Property'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {message.message}
                        </p>
                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatDateLong(message.createdAt)}</span>
                          <span>{message.email}</span>
                          {message.phone && <span>{message.phone}</span>}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        {!message.isRead && messageType === 'received' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(message.id || message._id);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                            title="Mark as read"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMessage(message.id || message._id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Delete message"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message Details */}
        <div className="space-y-6">
          {/* Message Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Messages</span>
                <span className="text-sm font-medium text-gray-900">
                  {messages?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Unread Messages</span>
                <span className="text-sm font-medium text-red-600">
                  {unreadCount?.count || 0}
                </span>
              </div>
              {isAdmin && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Message Types</span>
                  <div className="flex space-x-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      Received
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      Sent
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message Details Panel */}
          {selectedMessage ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Property</h4>
                  <p className="text-gray-900 font-medium">
                    {selectedMessage.property?.title || 'Unknown Property'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {messageType === 'received' ? 'From' : 'To'}
                  </h4>
                  <div className="space-y-2">
                    <p className="text-gray-900 font-medium">
                      {messageType === 'received' 
                        ? selectedMessage.fromUser?.name || 'Unknown'
                        : selectedMessage.toUser?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                    {selectedMessage.phone && (
                      <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Message</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line">{selectedMessage.message}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Sent: {formatDateLong(selectedMessage.createdAt)}</span>
                    {selectedMessage.readAt && (
                      <span>Read: {formatDateLong(selectedMessage.readAt)}</span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  {!selectedMessage.isRead && messageType === 'received' && (
                    <button
                      onClick={() => handleMarkAsRead(selectedMessage.id || selectedMessage._id)}
                      className="flex-1 btn-primary"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id || selectedMessage._id)}
                    className="flex-1 btn-secondary"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-center py-8">
                <EnvelopeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No message selected</h3>
                <p className="text-gray-600 mt-1">
                  Select a message from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}