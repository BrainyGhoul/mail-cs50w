class ShowEmail extends React.Component {

    render () {
        return (
            <table id="email_info">
                <tr>
                    <th>
                        From:
                    </th>
                    <td>
                        {this.props.from}
                    </td>
                </tr>
                <tr>
                    <th>
                        To:
                    </th>
                    <td>
                        {this.props.to}
                    </td>
                </tr>
                <tr>
                    <th>
                        Subject:
                    </th>
                    <td>
                        {this.props.subject}
                    </td>
                </tr>
                <tr>
                    <th>
                        Timestamp:
                    </th>
                    <td>
                        {this.props.timestamp}
                    </td>
                </tr>
            </table>
        );
    }
}
export default ShowEmail;