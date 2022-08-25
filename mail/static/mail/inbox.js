document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email("", "", ""));

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email() {

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
        recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value
    })
  })
  .then(response => response.json())
  .then(result => {

    // making an element to show a message after submitting
    const heading = document.createElement("h1");
    if (result.message === "Email sent successfully.")
    {
      heading.className = "alert alert-success";
      heading.innerHTML = result.message;
    } else {
      heading.className = "alert alert-danger";
      heading.innerHTML = result.error;
    }

    // showing that element
    const insert_into_element = document.querySelector("#emails-view");
    var first_child = insert_into_element.firstChild;
    if (first_child.tagName === "H1") {
      first_child.remove();
    }
    load_mailbox("sent");
    insert_into_element.insertBefore(heading, insert_into_element.firstChild);
    window.scrollTo(0, 0);
  });

  // clearing out the fields after submitting the form
  document.querySelectorAll('#compose-form *').forEach(element => {
    if (element.disabled === false && element.type != "submit") {
      element.value = "";
    }
  });
  return false;
}

function compose_email(recipients_of_email, subject_of_email, body_of_email) {
  
  // Show compose view and hide other views
  toggle_views("none", "none", "block");
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients_of_email;
  document.querySelector('#compose-subject').value = subject_of_email;
  document.querySelector('#compose-body').value = body_of_email;

  // after submitting form
  document.querySelector("#submit-form").onclick = send_email;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  history.pushState({"mailbox": mailbox}, "", "/");
  toggle_views("none", "block", "none");
  email_info_change("", "", "", "");

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        var container = document.createElement("div");
        container.onclick = () => {
          fetch(`/emails/${email.id}`)
          .then(response => response.json())
          .then(email => {
            history.pushState({"email": email}, "", `email/${email.id}`);
            change_button_state(email);
            toggle_views("block", "none", "none");
            email_info_change(email.sender, email.recipients, email.subject, email.timestamp, email.body);

            // marking as read
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  read: true
              })
            });

            var button = document.querySelector("#toggle-archive");
            if (email.sender === document.querySelector("#user-email").innerHTML) {
              button.style.display = "none";
            } else {
              button.style.display = "block";
            }


            button.onclick = () => {
              email.archived = !(email.archived);
              // changing the state of email
              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: email.archived
                })
              }).then(response => {
                if (response.ok === true) {
                  change_button_state(email);
                  load_mailbox("inbox");
                };  
              });
            };

            // loading the email composition page with the content necessary to reply
            document.querySelector("#reply-email").onclick = () => {
              var subject = email.subject;
              if (subject.slice(0, 3) != "Re:") {
                subject = `Re: ${subject}`;
              }
              var body = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
              compose_email(email.sender, subject, body);
            };
          });
        };
        container.className = "emailcard";
        container.innerHTML = `<span class="cardemail card-text"> ${email.sender} </span><span class="cardsubject card-text"> ${email.subject} </span><span class="cardtime card-text"> ${email.timestamp} </span>`;
        if (email.read == true) {
          container.style.backgroundColor = "lightgray";
        }
        document.querySelector("#emails-view").appendChild(container);
      });
  });

  // changing the inner content of the table containing the specific email info
  function email_info_change (email_sender, email_recipients, email_subject, email_timestamp, email_body) {
    document.querySelector("#email-from").innerHTML = email_sender;
    document.querySelector("#email-recipients").innerHTML = email_recipients;
    document.querySelector("#email-subject").innerHTML = email_subject;
    document.querySelector("#email-timestamp").innerHTML = email_timestamp;
    document.querySelector("#email-body").innerHTML = email_body;
  }

  function change_button_state (email) {
    var button = document.querySelector("#toggle-archive")
    // changing state of button
    if (email.archived === true) {
      button.innerHTML = "Unarchive";
    } else {
      button.innerHTML = "Archive";
    }
  }  
}


function toggle_views(email, emails, compose) {
  document.querySelector('#email-view').style.display = email;
  document.querySelector('#emails-view').style.display = emails;
  document.querySelector('#compose-view').style.display = compose;
}