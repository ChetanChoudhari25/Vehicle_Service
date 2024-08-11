document.addEventListener('DOMContentLoaded', () => {
    fetch('/admin/technicians')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('technician-table-body');
            data.forEach(tech => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${tech.username}</td>
                    <td>${tech.mobileNo}</td>
                    <td>${tech.businessName}</td>
                    <td>${tech.garageAddress}</td>
                    <td>${tech.experience}</td>
                    <td>
                        <button onclick="approveTechnician('${tech._id}')">Approve</button>
                        <button onclick="rejectTechnician('${tech._id}')">Reject</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        });
});

function approveTechnician(id) {
    fetch(`/admin/technicians/${id}/approve`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                alert('Technician approved');
                location.reload(); // Refresh the page
            } else {
                alert('Error approving technician');
            }
        });
}

function rejectTechnician(id) {
    fetch(`/admin/technicians/${id}/reject`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                alert('Technician rejected');
                location.reload(); // Refresh the page
            } else {
                alert('Error rejecting technician');
            }
        });
}
