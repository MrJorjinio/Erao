"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, User, auth } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadUser();
  }, [router]);

  const loadUser = async () => {
    try {
      const response = await api.getAccount();
      if (response.success) {
        setUser(response.data);
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
      }
    } catch (err) {
      setError("Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.updateAccount({ firstName, lastName });
      if (response.success) {
        setUser(response.data);
        auth.saveUser(response.data);
        setSuccess("Profile updated successfully");
      }
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      const response = await api.deleteAccount();
      if (response.success) {
        auth.clearTokens();
        router.push("/login");
      }
    } catch (err) {
      setError("Failed to delete account");
      console.error(err);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 p-10">
      {/* Header */}
      <div className="w-full max-w-lg bg-white rounded-2xl p-5">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm max-w-lg w-full">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm max-w-lg w-full">
          {success}
        </div>
      )}

      {/* Profile Form */}
      <form
        onSubmit={handleSave}
        className="w-full max-w-lg bg-white rounded-xl p-6 space-y-6"
      >
        {/* Avatar and Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">{initials}</span>
          </div>
          <div>
            <p className="font-semibold">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Name Fields */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-3 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Preferences */}
      <div className="w-full max-w-lg bg-white rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Preferences</h2>

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-sm">Dark Mode</p>
            <p className="text-gray-500 text-xs">
              Switch between light and dark theme
            </p>
          </div>
          <div className="w-12 h-7 bg-gray-100 rounded-full p-0.5 cursor-pointer">
            <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-sm">Delete Account</p>
            <p className="text-gray-500 text-xs">
              Permanently delete your account and data
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>

      <Link href="/ai" className="text-black text-sm font-medium hover:underline">
        &larr; Back to chat
      </Link>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold">Delete Account?</h3>
            <p className="text-gray-500 text-sm mt-2">
              This action cannot be undone. All your data, conversations, and
              database connections will be permanently deleted.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
