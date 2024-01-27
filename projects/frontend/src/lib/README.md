# Purpose of the 'lib' folder

The lib folder includes and should include libraries which in the future should be moved to an external npm package. The reason for now to include these directly into the repository is for the purpose of continuously adjusting these libraries without the burden of having to republish packages manually to test them. As the libraries mature to a v1 they can then be moved outsite to a seperated package.

As such, some of the files included may be non-compliant with the current linting rules, and the lib folder in its entirety has been moved to eslintignore.
