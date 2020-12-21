import React, { Component } from 'react';
import Error from 'next/error';

export default class ErrorPage extends Component {
  static async getInitialProps({ query }){
    return {
      statusCode: query.statusCode
    }
  }
  render() {
    return (<Error statusCode={this.props.statusCode} />)
  }
}