import React, { Component } from "react";
import { hot } from "react-hot-loader";
import "./App.css";
import { Query } from "react-apollo";
import gql from "graphql-tag";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img
            src="https://www.graphile.org/images/postgraphile.optimized.svg"
            className="App-logo"
            alt="logo"
          />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://www.graphile.org/postgraphile/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn PostGraphile
          </a>
          <Query
            query={gql`
              {
                nodeId
              }
            `}
          >
            {({ data, loading, error }) => {
              if (loading) return "Loading...";
              if (error) return `Error: ${error.message}`;
              if (data.nodeId === "query") return "✅ Working";
              return "This should not happen";
            }}
          </Query>
        </header>
      </div>
    );
  }
}

export default hot(module)(App);
