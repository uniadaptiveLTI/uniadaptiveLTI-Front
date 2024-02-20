This is is a front-end tool, using the LTI (Learning Tools Interoperability) Protocol, which is a standard developed by the IMS Global Learning Consortium. LTI allows for seamless integration of externally hosted web-based learning tools into Learning Management Systems (LMS) such as Moodle and Sakai. This project uses React, Bootstrap 5 and Next.js.

## Getting Started

### Normal install

- [Install NodeJS](https://nodejs.org/)
- [Install Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)

Install necessary dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

### Docker

You can build your own docker image suited to your needs.

For creating a development server image:

```bash
docker build --no-cache -f Dockerfile -t uniadaptivelti/frontdev:0.2.0 . --build-arg NEXT_MODE=dev
```
You can add additional arguments as you see fit.

## Learn More

To learn more about Next.js, React, Bootstrap 5 and React-Bootstrap, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [React Documentation](https://reactjs.org/docs/getting-started.html) - learn about React features and API.
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0/getting-started/introduction/) - learn about Bootstrap 5 features and usage.
- [React-Bootstrap Documentation](https://react-bootstrap.github.io/getting-started/introduction/) - learn about using Bootstrap with React.

![EN-Funded by the EU-BLACK Outline](https://github.com/uniadaptiveLTI/uniadaptiveLTI-Front/assets/91719773/93567f8d-d0c4-4fac-9e2a-8fe34cf4a1f6)
