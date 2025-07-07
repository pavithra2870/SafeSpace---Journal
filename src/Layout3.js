// ... existing code ...
export default function Layout3({ user }) {
    return (
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1">
          <Community />
        </div>
      </div>
    );
  }
  // ... existing code ...