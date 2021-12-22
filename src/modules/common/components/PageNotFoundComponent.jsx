import React from 'react';
 
 class PageNotFoundComponent extends React.Component {   
  render() {
    const { t } = this.props;
    return (
      
      <div id="no_page_found" className="">
       
               
            <div className="container mt-2 ">
                <div className="row justify-content-center">
                    <div className="msg">
                        <span className="fail">Page Not Found</span>
                        <p className="text1">Resource you tried is moved to another universe. Please try there.</p>
                    </div>
                </div>
            </div>  


      </div>
     


    );
  }

}

export default PageNotFoundComponent;