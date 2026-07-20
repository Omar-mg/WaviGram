export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-white/90 dark:bg-gray-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">WaviGram</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Where Conversations Meet Community.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>Features</li>
              <li>Security</li>
              <li>Mobile Apps</li>
              <li>Enterprise</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>About</li>
              <li>Blog</li>
              <li>Careers</li>
              <li>Press</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Cookie Policy</li>
              <li>Community Guidelines</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border/50">
          <div className="flex flex-col items-center sm:flex-row sm:justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} WaviGram. All rights reserved.
            </span>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                Twitter
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                Instagram
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}