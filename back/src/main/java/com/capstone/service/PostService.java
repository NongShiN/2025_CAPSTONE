package com.capstone.service;

import com.capstone.dto.PostDTO;
import com.capstone.entity.Post;
import com.capstone.entity.Tag;
import com.capstone.entity.User;
import com.capstone.repository.PostRepository;
import com.capstone.repository.TagRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    public List<PostDTO> getAllPosts() {
        return postRepository.findAllWithUserAndTags().stream()
                .map(post -> PostDTO.builder()
                    .id(post.getId())
                    .title(post.getTitle())
                    .content(post.getContent())
                    .viewCount(post.getViewCount())
                    .likeCount(post.getLikeCount())
                    .commentCount(post.getCommentCount())
                    .createdAt(post.getCreatedAt())
                    .username(post.getUser() != null ? post.getUser().getUsername() : "알 수 없음")
                    .tags(post.getTags().stream()
                            .map(Tag::getName)
                            .collect(Collectors.toList()))
                    .build())
                .collect(Collectors.toList());
    }

    public PostDTO getPost(Long id) {
        Post post = postRepository.findByIdWithUserAndTags(id);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }
        return convertToDTO(post);
    }

    @Transactional
    public PostDTO createPost(PostDTO postDTO, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .title(postDTO.getTitle())
                .content(postDTO.getContent())
                .user(user)
                .build();

        if (postDTO.getTags() != null) {
            postDTO.getTags().forEach(tagName -> {
                Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> tagRepository.save(Tag.builder().name(tagName).build()));
                post.getTags().add(tag);
            });
        }

        return convertToDTO(postRepository.save(post));
    }

    @Transactional
    public PostDTO updatePost(Long id, PostDTO postDTO, Long userId) {
        Post post = postRepository.findByIdWithUserAndTags(id);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }
        
        // 작성자 권한 체크
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this post");
        }

        post.setTitle(postDTO.getTitle());
        post.setContent(postDTO.getContent());

        if (postDTO.getTags() != null) {
            post.getTags().clear();
            postDTO.getTags().forEach(tagName -> {
                Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> tagRepository.save(Tag.builder().name(tagName).build()));
                post.getTags().add(tag);
            });
        }

        return convertToDTO(postRepository.save(post));
    }

    @Transactional
    public void deletePost(Long id, Long userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
                
        // 작성자 권한 체크
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this post");
        }
        
        postRepository.delete(post);
    }

    @Transactional
    public void likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (post.getLikedUsers().contains(user)) {
            // 이미 좋아요를 누른 경우 좋아요 취소
            post.getLikedUsers().remove(user);
        } else {
            // 좋아요 추가
            post.getLikedUsers().add(user);
        }
        post.setLikeCount(post.getLikedUsers().size());
        postRepository.save(post);
    }

    @Transactional
    public void increaseViewCount(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
    }

    private PostDTO convertToDTO(Post post) {
        return PostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .createdAt(post.getCreatedAt())
                .username(post.getUser().getUsername())
                .tags(post.getTags().stream()
                        .map(Tag::getName)
                        .collect(Collectors.toList()))
                .build();
    }
} 