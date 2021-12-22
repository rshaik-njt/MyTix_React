import React, { Component } from 'react';
import Loader from 'react-loader-spinner';


class LoadingComponent extends Component {
   render() {
     return (
          <div
           style={{
             width: "100%",
             height: "100%",
             display: "flex",
             justifyContent: "center",
             alignItems: "center",
             marginTop : "20%"
           }}
         >
          <Loader type="ThreeDots" color="#FF8A00"/>
        </div>
     );
   }

}


export default LoadingComponent;