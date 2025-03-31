import Link from 'next/link';

const Navbar = () => {
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Book-Names', href: '/booknames' },
    { name: 'Subjects', href: '/subjects' },
    { name: 'Schools', href: '/schools' },
    { name: 'Publication', href: '/publication' },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="text-xl font-bold text-gray-800">
              Shelf Manager
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md">
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 