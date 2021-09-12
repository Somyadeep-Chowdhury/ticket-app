import React from 'react'
import { connect } from 'react-redux'

export const Dashboard = (props) => {
    return (
        <div>
            <iframe src="https://app.powerbi.com/reportEmbed?reportId=b821eebf-d96f-4c22-bdde-3961058e8361&autoAuth=true&ctid=c28301bb-e8ea-480b-a82a-cf3553901822&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLWluZGlhLWNlbnRyYWwtYS1wcmltYXJ5LXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0LyJ9" title="Self D" width='100%' height='720' frameBorder="0" allowFullScreen={true}/>
        </div>
    )
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
