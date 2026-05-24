import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import {
  UserCircleIcon,
  BookOpenIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UsersIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { Fragment } from "react";

const Navbar = () => {
  const { user, logout, isAuthenticated, isStudent, isTutor, isAdmin } =
    useAuth();

  const getDashboardLink = () => {
    if (isStudent) return "/dashboard/student";
    if (isTutor) return "/dashboard/tutor";
    if (isAdmin) return "/dashboard/admin";
    return "/";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Study
              </span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex ml-10 space-x-4">
                {/* Only Students can find tutors */}
                {isStudent && (
                  <Link
                    to="/tutors"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Find Tutors
                  </Link>
                )}

                <Link
                  to={getDashboardLink()}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>

                {/* Admin Specific Links */}
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/users"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                    >
                      <UsersIcon className="h-4 w-4" />
                      Users
                    </Link>
                    <Link
                      to="/admin/tutors"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                    >
                      <AcademicCapIcon className="h-4 w-4" />
                      Manage Tutors
                    </Link>
                    <Link
                      to="/admin/tutor-approval"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                    >
                      <UserGroupIcon className="h-4 w-4" />
                      Approve Tutors
                    </Link>
                    <Link
                      to="/admin/audit-logs"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                    >
                      <ClipboardDocumentListIcon className="h-4 w-4" />
                      Audit Logs
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  )}
                  <span className="text-sm font-medium hidden md:inline">
                    {user?.name}
                  </span>
                  {isAdmin && (
                    <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full hidden md:inline">
                      Admin
                    </span>
                  )}
                  {isTutor && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full hidden md:inline">
                      Tutor
                    </span>
                  )}
                  {isStudent && (
                    <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full hidden md:inline">
                      Student
                    </span>
                  )}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${active ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-gray-700`}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to={getDashboardLink()}
                            className={`${active ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-gray-700`}
                          >
                            Dashboard
                          </Link>
                        )}
                      </Menu.Item>

                      {/* Admin quick links in dropdown */}
                      {isAdmin && (
                        <>
                          <div className="border-t my-1"></div>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin/users"
                                className={`${active ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-gray-700`}
                              >
                                <UsersIcon className="h-4 w-4 inline mr-2" />
                                Manage Users
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin/tutors"
                                className={`${active ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-gray-700`}
                              >
                                <AcademicCapIcon className="h-4 w-4 inline mr-2" />
                                Manage Tutors
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin/tutor-approval"
                                className={`${active ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-gray-700`}
                              >
                                <UserGroupIcon className="h-4 w-4 inline mr-2" />
                                Approve Tutors
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin/audit-logs"
                                className={`${active ? "bg-gray-100" : ""} block px-4 py-2 text-sm text-gray-700`}
                              >
                                <ClipboardDocumentListIcon className="h-4 w-4 inline mr-2" />
                                Audit Logs
                              </Link>
                            )}
                          </Menu.Item>
                        </>
                      )}

                      <div className="border-t my-1"></div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${active ? "bg-gray-100" : ""} block w-full text-left px-4 py-2 text-sm text-red-600`}
                          >
                            Sign Out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;