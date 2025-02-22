import { useState } from "react";
import Layout from "./Layout/Layout";

const Register = () => {
  const [formdata, setFormdata] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    avatar: "",
    coverImage: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormdata({ ...formdata, [name]: value });
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    setFormdata({ ...formdata, [name]: files[0] }); // Store file object
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formdata); // For testing
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-8 shadow-md rounded-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-gray-600 font-semibold">Full Name:</label>
              <input
                type="text"
                name="fullName"
                value={formdata.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-600 font-semibold">Username:</label>
              <input
                type="text"
                name="username"
                value={formdata.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-600 font-semibold">Email:</label>
              <input
                type="email"
                name="email"
                value={formdata.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-600 font-semibold">Password:</label>
              <input
                type="password"
                name="password"
                value={formdata.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold">Avatar:</label>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-lg cursor-pointer"
                required
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-gray-600 font-semibold">Cover Image:</label>
              <input
                type="file"
                name="coverImage"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-lg cursor-pointer"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-300 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg transition duration-200"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
