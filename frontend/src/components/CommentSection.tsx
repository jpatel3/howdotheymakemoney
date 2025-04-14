import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  companyId: string;
  isLoggedIn: boolean;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  display_name: string;
  avatar_url: string | null;
}

export default function CommentSection({ companyId, isLoggedIn }: CommentSectionProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newComment, setNewComment] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('comments');
  const [userVote, setUserVote] = React.useState<'upvote' | 'downvote' | null>(null);
  const [voteCount, setVoteCount] = React.useState({ upvotes: 0, downvotes: 0 });

  // Fetch comments
  React.useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?companyId=${companyId}`);
        const data = await response.json();
        
        if (data.success) {
          setComments(data.comments);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [companyId]);

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !isLoggedIn) return;
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          content: newComment,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh comments
        const commentsResponse = await fetch(`/api/comments?companyId=${companyId}`);
        const commentsData = await commentsResponse.json();
        
        if (commentsData.success) {
          setComments(commentsData.comments);
          setNewComment('');
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  // Handle voting
  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isLoggedIn) return;
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          voteType,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // If same vote type, toggle off
        if (userVote === voteType) {
          setUserVote(null);
          setVoteCount({
            ...voteCount,
            [voteType + 's']: voteCount[voteType + 's' as keyof typeof voteCount] - 1,
          });
        } 
        // If different vote type, switch vote
        else if (userVote) {
          setUserVote(voteType);
          setVoteCount({
            [voteType + 's']: voteCount[voteType + 's' as keyof typeof voteCount] + 1,
            [(userVote + 's') as keyof typeof voteCount]: 
              voteCount[(userVote + 's') as keyof typeof voteCount] - 1,
          });
        } 
        // If no previous vote, add new vote
        else {
          setUserVote(voteType);
          setVoteCount({
            ...voteCount,
            [voteType + 's']: voteCount[voteType + 's' as keyof typeof voteCount] + 1,
          });
        }
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <Tabs defaultValue="comments" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comments" className="text-base">
            Comments ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="vote" className="text-base">
            Vote on this Report
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments" className="mt-6">
          {isLoggedIn ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white min-h-24 focus:outline-none focus:ring-2 focus:ring-neon-green"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  type="submit" 
                  disabled={!newComment.trim()}
                  className="bg-neon-green text-black hover:bg-neon-green/90"
                >
                  Post Comment
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-neutral-800 p-4 rounded-lg mb-8 text-center">
              <p className="text-gray-400">
                <a href="/login" className="text-neon-green hover:underline">Log in</a> to join the conversation
              </p>
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-neutral-800 p-4 rounded-lg animate-pulse h-32"></div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-neutral-800 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {comment.avatar_url ? (
                        <img 
                          src={comment.avatar_url} 
                          alt={comment.display_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-neutral-500">
                          {comment.display_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-white">{comment.display_name}</h4>
                        <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-300 mt-2">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="vote" className="mt-6">
          <div className="bg-neutral-800 p-6 rounded-lg text-center">
            <h3 className="text-xl font-medium mb-6 text-white">Was this report helpful?</h3>
            
            <div className="flex justify-center gap-8">
              <div className="flex flex-col items-center">
                <Button
                  variant={userVote === 'upvote' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleVote('upvote')}
                  disabled={!isLoggedIn}
                  className={userVote === 'upvote' ? 'bg-positive-green hover:bg-positive-green/90 border-positive-green' : ''}
                >
                  <ThumbsUp className="h-8 w-8" />
                </Button>
                <span className="mt-2 text-lg font-medium">{voteCount.upvotes}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Button
                  variant={userVote === 'downvote' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleVote('downvote')}
                  disabled={!isLoggedIn}
                  className={userVote === 'downvote' ? 'bg-negative-red hover:bg-negative-red/90 border-negative-red' : ''}
                >
                  <ThumbsDown className="h-8 w-8" />
                </Button>
                <span className="mt-2 text-lg font-medium">{voteCount.downvotes}</span>
              </div>
            </div>
            
            {!isLoggedIn && (
              <p className="mt-6 text-gray-400">
                <a href="/login" className="text-neon-green hover:underline">Log in</a> to vote on this report
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
