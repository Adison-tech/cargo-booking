# CargoBooking: Digital Freight Management Platform

**CargoBooking** is a comprehensive, full-stack web application designed to **digitally transform the cargo booking workflow**. It serves as a centralized platform for shippers, agents, and administrators to efficiently manage freight quoting, booking, documentation, and real-time tracking.

## Key Features
* **Integrated Quoting Engine:** Real-time calculation of shipping costs based on dynamic parameters (using `axios` and `unirest` for external API integration).
* **Secure Authentication:** Role-based access control for Shippers and Administrators managed via **Passport.js** and `express-session`.
* **Booking Lifecycle Management:** Intuitive dashboard to create, view, modify, and cancel shipments.
* **Automated Document Handling:** Secure uploading and processing of required documents (e.g., Bill of Lading, Commercial Invoice) using `multer` and image manipulation with `Sharp`.
* **Notification System:** Automated email alerts for booking confirmation and status changes via `nodemailer`.
* **Minimal Footprint:** Utilizes SQLite for a simple, file-based database setup, ideal for rapid deployment and development environments.

## Getting Started

These instructions detail the process of setting up and running the application on a local development environment.

### Prerequisites
Ensure you have the following software installed:
* **Node.js** (v18.x or newer)
* **pnpm** (Performant Node Package Manager)

### Installation and Setup

1. **Clone the Repository:**
    Download the project source code and navigate into the project directory.

    ```bash
    git clone [https://github.com/Adison-tech/cargo-booking.git](https://github.com/Adison-tech/cargo-booking.git)
    cd cargo-booking
    ```

2. **Install Dependencies:**
    Use pnpm to install all required packages.

    ```bash
    pnpm install
    ```

3. **Environment Configuration:**
    Create a file named **`.env`** in the project root to store necessary environment variables.
    ```properties
    # .env
    # A long, random string for express-session security
    SESSION_SECRET="YOUR_HIGHLY_RANDOM_SECRET_KEY"

    # Nodemailer (SMTP) Configuration
    EMAIL_USER="your.smtp.username@domain.com"
    EMAIL_PASS="your_smtp_app_password"
    # Example API key for external rate lookups
    CARRIER_X_API_KEY="xxx-yyy-zzz"
    ```

4. **Database Initialization:**
    The system uses SQLite, which automatically creates the cargo.db file upon initial startup if it doesn't exist.

## Running the Application
Start the development server. The **`package.json`** is configured to use Nodemon for continuous development.

```bash
pnpm start
```

The application will be accessible via your web browser at: http://localhost:5001.

## Technology Stack
This platform is engineered using a robust set of Node.js modules and frameworks:

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | Node.js / Express | Core server routing and API handling. |
| **Database** | `sqlite3` | Local, file-based persistence layer for rapid development. |
| **Templating** | `EJS` | Dynamic view rendering engine. |
| **Authentication** | `passport`, `express-session` | User session and secure login management. |
| **Image Processing** | `sharp`, `multer` | High-performance handling of file uploads and image resizing/validation. |
| **API Integration** | `axios`, `unirest` | Client libraries for interfacing with external carrier and routing APIs. |
| **Development** | `nodemon` | Automatically restarts the server during development. |

### Contributing
We welcome professional contributions that enhance the stability, performance, or feature set of CargoBooking.
  1. **Fork** the repository.
  2. Create your feature branch:
      ```bash
      git checkout -b feature/issue-101-new-reporting-module
      ```
  3. Commit your changes using a clear convention:
      ```bash
      git commit -m 'feat: implement initial PDF invoice generation'
      ```
  4. Push to the branch:
      ```bash
      git push origin feature/issue-101-new-reporting-module
      ```
  5. Open a **Pull Request** detailing the changes and linking to any relevant issues.

## License and Contact

### License
This project is licensed under the **ISC License**. See the accompanying LICENSE file for full legal details.

### Contact
For support, business inquiries, or technical discussion, please reach out to the project maintainer:
  * **Adison Cheruiyot** - adisoncheruiyot55@gmail.com
  * **Kiptoo Chepkonga** - ekchepkonga@kabarak.ac.ke

Project Link: [https://github.com/Adison-tech/cargo-booking.git](https://github.com/Adison-tech/cargo-booking.git)